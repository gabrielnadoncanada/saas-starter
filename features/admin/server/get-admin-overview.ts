import "server-only";

import { subDays } from "date-fns";

import { billingConfig } from "@/config/billing.config";
import { getAdminOverviewStats } from "@/features/admin/server/users";
import { db } from "@/lib/db/prisma";

const WINDOW_DAYS = 30;
const RECENT_LIMIT = 8;

type DailyBucket = {
  dateKey: string;
  label: string;
  users: number;
  orgs: number;
};

function buildBuckets(): DailyBucket[] {
  return Array.from({ length: WINDOW_DAYS }, (_, index) => {
    const date = subDays(new Date(), WINDOW_DAYS - 1 - index);
    return {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      users: 0,
      orgs: 0,
    };
  });
}

function fillBuckets(
  buckets: DailyBucket[],
  rows: { createdAt: Date }[],
  field: "users" | "orgs",
) {
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.find((b) => b.dateKey === key);
    if (bucket) bucket[field] += 1;
  }
}

export type AdminSignupsSeries = {
  label: string;
  users: number;
  orgs: number;
};

export type AdminPlanSlice = {
  planId: string;
  planName: string;
  count: number;
  percent: number;
};

export type AdminRecentItem =
  | {
      kind: "user.signup";
      id: string;
      at: Date;
      name: string | null;
      email: string;
    }
  | {
      kind: "org.created";
      id: string;
      at: Date;
      name: string;
      slug: string | null;
    };

function planNameFor(planId: string) {
  return (
    billingConfig.plans.find((p) => p.id === planId)?.name ??
    planId.charAt(0).toUpperCase() + planId.slice(1)
  );
}

export async function getAdminDashboardOverview() {
  const since = subDays(new Date(), WINDOW_DAYS);

  const [
    stats,
    userHistory,
    orgHistory,
    activeSubs,
    recentUsers,
    recentOrgs,
  ] = await Promise.all([
    getAdminOverviewStats(),
    db.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.organization.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.subscription.findMany({
      where: { status: { in: ["active", "trialing"] } },
      select: { plan: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.organization.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
      select: { id: true, name: true, slug: true, createdAt: true },
    }),
  ]);

  const buckets = buildBuckets();
  fillBuckets(buckets, userHistory, "users");
  fillBuckets(buckets, orgHistory, "orgs");

  const series: AdminSignupsSeries[] = buckets.map(
    ({ dateKey: _k, ...rest }) => rest,
  );

  const paidCounts = new Map<string, number>();
  for (const sub of activeSubs) {
    paidCounts.set(sub.plan, (paidCounts.get(sub.plan) ?? 0) + 1);
  }
  const paidTotal = activeSubs.length;
  const freeCount = Math.max(0, stats.totalOrganizations - paidTotal);
  const totalForPercent = stats.totalOrganizations || 1;

  const planSlices: AdminPlanSlice[] = [
    {
      planId: "free",
      planName: planNameFor("free"),
      count: freeCount,
      percent: Math.round((freeCount / totalForPercent) * 100),
    },
    ...Array.from(paidCounts.entries())
      .map(([planId, count]) => ({
        planId,
        planName: planNameFor(planId),
        count,
        percent: Math.round((count / totalForPercent) * 100),
      }))
      .sort((a, b) => b.count - a.count),
  ];

  const userItems: AdminRecentItem[] = recentUsers.map((u) => ({
    kind: "user.signup",
    id: u.id,
    at: u.createdAt,
    name: u.name,
    email: u.email,
  }));
  const orgItems: AdminRecentItem[] = recentOrgs.map((o) => ({
    kind: "org.created",
    id: o.id,
    at: o.createdAt,
    name: o.name,
    slug: o.slug,
  }));

  const recent = [...userItems, ...orgItems]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, RECENT_LIMIT);

  return {
    stats,
    signupsSeries: series,
    planSlices,
    recent,
  };
}

export type AdminDashboardData = Awaited<
  ReturnType<typeof getAdminDashboardOverview>
>;
