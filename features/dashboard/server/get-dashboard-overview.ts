import "server-only";

import { subDays } from "date-fns";

import { routes } from "@/constants/routes";
import { checkLimit, hasCapability } from "@/features/billing/entitlements";
import { getPlan } from "@/features/billing/plans";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { getMonthlyUsage } from "@/features/billing/server/usage-service";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

const ACTIVITY_DAYS = 14;
const ACTIVITY_FEED_LIMIT = 8;

type DailyBucket = {
  dateKey: string;
  label: string;
  tasks: number;
  ai: number;
};

function buildDailyBuckets(): DailyBucket[] {
  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = subDays(new Date(), ACTIVITY_DAYS - 1 - index);
    return {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tasks: 0,
      ai: 0,
    };
  });
}

function fillBuckets(
  buckets: DailyBucket[],
  events: { createdAt: Date }[],
  field: "tasks" | "ai",
) {
  for (const event of events) {
    const key = event.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.find((b) => b.dateKey === key);
    if (bucket) bucket[field] += 1;
  }
}

function sumLastN(buckets: DailyBucket[], days: number, field: "tasks" | "ai") {
  return buckets.slice(-days).reduce((acc, b) => acc + b[field], 0);
}

function computeDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0
      ? { direction: "flat" as const, percent: 0 }
      : { direction: "up" as const, percent: 100 };
  }
  const ratio = ((current - previous) / previous) * 100;
  if (Math.abs(ratio) < 0.5) return { direction: "flat" as const, percent: 0 };
  return ratio >= 0
    ? { direction: "up" as const, percent: Math.round(ratio) }
    : { direction: "down" as const, percent: Math.round(Math.abs(ratio)) };
}

export type ActivityFeedItem =
  | {
      kind: "task.created";
      id: string | number;
      at: Date;
      title: string;
      code: string;
      status: string;
    }
  | {
      kind: "ai.conversation";
      id: string;
      at: Date;
      title: string;
      surface: string;
    }
  | {
      kind: "member.joined";
      id: string;
      at: Date;
      name: string;
      email: string;
      role: string;
    };

export type DashboardActivitySeries = {
  label: string;
  tasks: number;
  ai: number;
};

export type DashboardDelta = {
  direction: "up" | "down" | "flat";
  percent: number;
};

export async function getDashboardOverview() {
  const [organization, entitlements] = await Promise.all([
    getCurrentOrganization(),
    getCurrentEntitlements(),
  ]);
  const plan = getPlan(entitlements?.planId ?? "free");
  const memberCount = organization?.members?.length ?? 0;
  const organizationId = organization?.id ?? null;

  const since = subDays(new Date(), ACTIVITY_DAYS);

  const [
    taskCount,
    recentTasks,
    tasksUsage,
    aiCreditsUsage,
    assistantConversationCount,
    taskHistory,
    aiHistory,
    memberJoinHistory,
    feedTasks,
    feedAi,
    feedMembers,
  ] = organizationId
    ? await Promise.all([
        db.task.count({ where: { organizationId } }),
        db.task.findMany({
          where: { organizationId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        getMonthlyUsage(organizationId, "tasksPerMonth"),
        getMonthlyUsage(organizationId, "aiCredits"),
        db.aiConversation.count({ where: { organizationId } }),
        db.task.findMany({
          where: { organizationId, createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.aiConversation.findMany({
          where: { organizationId, createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.member.findMany({
          where: { organizationId, createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        db.task.findMany({
          where: { organizationId, createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: ACTIVITY_FEED_LIMIT,
          select: { id: true, code: true, title: true, status: true, createdAt: true },
        }),
        db.aiConversation.findMany({
          where: { organizationId, createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: ACTIVITY_FEED_LIMIT,
          select: { id: true, title: true, surface: true, createdAt: true },
        }),
        db.member.findMany({
          where: { organizationId, createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: ACTIVITY_FEED_LIMIT,
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        }),
      ])
    : [0, [], 0, 0, 0, [], [], [], [], [], []];

  const taskLimit = entitlements
    ? checkLimit(entitlements, "tasksPerMonth", tasksUsage)
    : { allowed: false, limit: 0, currentUsage: 0, remaining: 0 };
  const canUseAI = entitlements ? hasCapability(entitlements, "ai.assistant") : false;
  const aiCreditsLimit = entitlements
    ? checkLimit(entitlements, "aiCredits", aiCreditsUsage)
    : { allowed: false, limit: 0, currentUsage: 0, remaining: 0 };

  const buckets = buildDailyBuckets();
  fillBuckets(buckets, taskHistory, "tasks");
  fillBuckets(buckets, aiHistory, "ai");

  const tasksLast7 = sumLastN(buckets, 7, "tasks");
  const tasksPrev7 = sumLastN(buckets.slice(0, ACTIVITY_DAYS - 7), 7, "tasks");
  const aiLast7 = sumLastN(buckets, 7, "ai");
  const aiPrev7 = sumLastN(buckets.slice(0, ACTIVITY_DAYS - 7), 7, "ai");

  const tasksDelta = computeDelta(tasksLast7, tasksPrev7);
  const aiDelta = computeDelta(aiLast7, aiPrev7);
  const membersJoinedLast7 = memberJoinHistory.filter(
    (m) => m.createdAt >= subDays(new Date(), 7),
  ).length;

  const series: DashboardActivitySeries[] = buckets.map(({ dateKey: _k, ...rest }) => rest);

  const taskFeedItems: ActivityFeedItem[] = feedTasks.map((t) => ({
    kind: "task.created",
    id: t.id,
    at: t.createdAt,
    title: t.title,
    code: t.code,
    status: t.status,
  }));
  const aiFeedItems: ActivityFeedItem[] = feedAi.map((c) => ({
    kind: "ai.conversation",
    id: c.id,
    at: c.createdAt,
    title: c.title,
    surface: c.surface,
  }));
  const memberFeedItems: ActivityFeedItem[] = feedMembers.map((m) => ({
    kind: "member.joined",
    id: m.id,
    at: m.createdAt,
    name: m.user?.name ?? "Unknown",
    email: m.user?.email ?? "",
    role: m.role,
  }));

  const activityFeed = [...taskFeedItems, ...aiFeedItems, ...memberFeedItems]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, ACTIVITY_FEED_LIMIT);

  const checklist = [
    {
      id: "first-task",
      title: "Create your first task",
      done: taskCount > 0,
      href: routes.app.tasks,
    },
    {
      id: "invite-team",
      title: "Invite a teammate",
      done: memberCount > 1,
      href: routes.settings.members,
      hidden: !entitlements || !hasCapability(entitlements, "team.invite"),
    },
    {
      id: "try-assistant",
      title: "Use the AI assistant",
      done: assistantConversationCount > 0,
      href: routes.app.assistant,
      hidden: !canUseAI,
    },
  ].filter((item) => !item.hidden);

  return {
    organization,
    entitlements,
    plan,
    planId: entitlements?.planId ?? "free",
    memberCount,
    taskCount,
    tasksUsage,
    assistantConversationCount,
    taskLimit,
    aiCreditsUsage,
    aiCreditsLimit,
    canUseAI,
    recentTasks,
    activitySeries: series,
    kpis: {
      tasksLast7,
      tasksDelta,
      aiLast7,
      aiDelta,
      membersJoinedLast7,
    },
    activityFeed,
    checklist,
  };
}

export type DashboardOverviewData = Awaited<
  ReturnType<typeof getDashboardOverview>
>;
