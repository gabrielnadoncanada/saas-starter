import "server-only";

import { subDays } from "date-fns";
import { getTranslations } from "next-intl/server";

import { listOrganizationAuditLogs } from "@/features/audit/server/record-audit-log";
import { getPlan } from "@/features/billing/catalog/resolver";
import { checkLimit, hasCapability } from "@/features/billing/guards/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { getMonthlyUsage } from "@/features/billing/usage/usage-service";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { routes } from "@/shared/constants/routes";
import { db } from "@/shared/lib/db/prisma";

function buildUsageChart(tasks: { createdAt: Date }[], locale: string) {
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(new Date(), 6 - index);

    return {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      tasks: 0,
    };
  });

  for (const task of tasks) {
    const key = task.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.dateKey === key);

    if (bucket) {
      bucket.tasks += 1;
    }
  }

  return buckets.map(({ dateKey: _dateKey, ...item }) => item);
}

export async function getDashboardOverview(locale: string) {
  const t = await getTranslations("dashboard");
  const [organization, entitlements] = await Promise.all([
    getCurrentOrganization(),
    getCurrentOrganizationEntitlements(),
  ]);
  const plan = getPlan(entitlements?.planId ?? "free");
  const memberCount = organization?.members?.length ?? 0;
  const organizationId = organization?.id ?? null;

  const [
    taskCount,
    recentTasks,
    tasksUsage,
    creditBalance,
    recentActivity,
    recentTaskHistory,
  ] =
    organizationId
      ? await Promise.all([
          db.task.count({
            where: { organizationId },
          }),
          db.task.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
          getMonthlyUsage(organizationId, "tasksPerMonth"),
          Promise.resolve(entitlements?.creditBalance ?? 0),
          listOrganizationAuditLogs(organizationId, 8),
          db.task.findMany({
            where: {
              organizationId,
              createdAt: {
                gte: subDays(new Date(), 6),
              },
            },
            select: {
              createdAt: true,
            },
          }),
        ])
      : [0, [], 0, 0, [], []];

  const taskLimit = entitlements
    ? checkLimit(entitlements, "tasksPerMonth", tasksUsage)
    : { allowed: false, limit: 0, currentUsage: 0, remaining: 0 };
  const canUseAI = entitlements ? hasCapability(entitlements, "ai.assistant") : false;

  const checklist = [
    {
      id: "first-task",
      title: t("checklist.firstTask"),
      done: taskCount > 0,
      href: routes.app.tasks,
    },
    {
      id: "invite-team",
      title: t("checklist.inviteTeam"),
      done: memberCount > 1,
      href: routes.settings.members,
      hidden: !entitlements || !hasCapability(entitlements, "team.invite"),
    },
    {
      id: "try-assistant",
      title: t("checklist.tryAssistant"),
      done: creditBalance > 0,
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
    creditBalance,
    taskLimit,
    canUseAI,
    recentActivity,
    recentTasks,
    usageChart: buildUsageChart(recentTaskHistory, locale),
    checklist,
  };
}
