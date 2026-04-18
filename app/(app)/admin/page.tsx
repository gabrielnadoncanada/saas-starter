import { Building2, ShieldBan, ShieldCheck, Users } from "lucide-react";

import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { AdminPlanBreakdown } from "@/features/admin/components/admin-plan-breakdown";
import { AdminRecentActivity } from "@/features/admin/components/admin-recent-activity";
import { AdminSignupsChart } from "@/features/admin/components/admin-signups-chart";
import { getAdminDashboardOverview } from "@/features/admin/server/get-admin-overview";

export default async function AdminDashboardPage() {
  const { stats, signupsSeries, planSlices, recent } =
    await getAdminDashboardOverview();

  const cards = [
    {
      title: "Users · total",
      value: stats.totalUsers,
      hint: "Registered accounts",
      icon: Users,
      accent: true,
    },
    {
      title: "Users · active",
      value: stats.activeUsers,
      hint: "Not banned",
      icon: ShieldCheck,
    },
    {
      title: "Users · banned",
      value: stats.bannedUsers,
      hint: "Access revoked",
      icon: ShieldBan,
      tone: stats.bannedUsers > 0 ? ("danger" as const) : undefined,
    },
    {
      title: "Organizations",
      value: stats.totalOrganizations,
      hint: "Active tenants",
      icon: Building2,
    },
  ];

  return (
    <Page>
      <PageHeader eyebrow="Admin · Overview">
        <PageTitle>Administration</PageTitle>
        <PageDescription>
          Platform overview and user management.
        </PageDescription>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid gap-px border border-border bg-border grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((stat) => (
            <div
              key={stat.title}
              className="relative overflow-hidden bg-card p-5"
            >
              {stat.accent ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-brand"
                />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <p className="label-mono">{stat.title}</p>
                <stat.icon
                  className={
                    stat.tone === "danger"
                      ? "size-4 text-destructive"
                      : "size-4 text-muted-foreground"
                  }
                  strokeWidth={1.75}
                />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-[-0.02em]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-12">
          <div className="col-span-12 xl:col-span-8">
            <div className="h-full border border-border bg-card p-5">
              <AdminSignupsChart data={signupsSeries} />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <AdminPlanBreakdown
              slices={planSlices}
              totalOrganizations={stats.totalOrganizations}
            />
          </div>
          <div className="col-span-12">
            <AdminRecentActivity items={recent} />
          </div>
        </div>
      </div>
    </Page>
  );
}
