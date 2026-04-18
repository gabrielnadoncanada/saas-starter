import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { routes } from "@/constants/routes";
import { DashboardActivityChart } from "@/features/dashboard/components/dashboard-activity-chart";
import { DashboardActivityFeed } from "@/features/dashboard/components/dashboard-activity-feed";
import { DashboardKpiCard } from "@/features/dashboard/components/dashboard-kpi-card";
import { DashboardPlanCard } from "@/features/dashboard/components/dashboard-plan-card";
import { DashboardSparkline } from "@/features/dashboard/components/dashboard-sparkline";
import { DashboardOrganizationCard } from "@/features/dashboard/components/dashboard-organization-card";
import type { DashboardOverviewData } from "@/features/dashboard/server/get-dashboard-overview";

type DashboardOverviewProps = {
  overview: DashboardOverviewData;
};

export function DashboardOverview({ overview }: DashboardOverviewProps) {
  const {
    organization,
    planId,
    plan,
    memberCount,
    taskCount,
    tasksUsage,
    taskLimit,
    aiCreditsUsage,
    aiCreditsLimit,
    activitySeries,
    activityFeed,
    kpis,
    checklist,
  } = overview;

  const organizationName = organization?.name ?? "your organization";
  const tasksSpark = activitySeries.map((s) => ({ value: s.tasks }));
  const aiSpark = activitySeries.map((s) => ({ value: s.ai }));
  const membersSpark = activitySeries.map(() => ({ value: 0 }));
  const checklistRemaining = checklist.filter((item) => !item.done);

  return (
    <div className="space-y-6">
      {checklistRemaining.length > 0 ? (
        <ChecklistStrip items={checklistRemaining} />
      ) : null}

      <div className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-border">
        <DashboardKpiCard
          label="Tasks · 7 days"
          value={kpis.tasksLast7}
          hint={`${taskCount} lifetime`}
          delta={kpis.tasksDelta}
          visual={
            <DashboardSparkline
              data={tasksSpark}
              className="h-full w-full"
              color="var(--brand)"
            />
          }
          accent
          className="border-0"
        />
        <DashboardKpiCard
          label="AI calls · 7 days"
          value={kpis.aiLast7}
          hint={`${aiCreditsUsage} credits used`}
          delta={kpis.aiDelta}
          visual={
            <DashboardSparkline
              data={aiSpark}
              className="h-full w-full"
              color="hsl(var(--brand-hsl) / 0.55)"
            />
          }
          className="border-0"
        />
        <DashboardKpiCard
          label="Members"
          value={memberCount}
          hint={`${kpis.membersJoinedLast7} joined this week`}
          visual={
            <DashboardSparkline
              data={membersSpark}
              className="h-full w-full opacity-40"
            />
          }
          className="border-0"
        />
        <DashboardKpiCard
          label="Plan"
          value={plan.name}
          hint={`${tasksUsage}/${taskLimit.limit} tasks this cycle`}
          className="border-0"
        />
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 xl:col-span-8">
          <div className="h-full border border-border bg-card p-5">
            <DashboardActivityChart data={activitySeries} />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DashboardPlanCard
            billingInterval={organization?.billingInterval ?? null}
            cancelAtPeriodEnd={organization?.cancelAtPeriodEnd ?? false}
            periodEnd={organization?.periodEnd ?? null}
            planId={planId}
            planName={plan.name}
            subscriptionStatus={organization?.subscriptionStatus ?? null}
            trialEnd={organization?.trialEnd ?? null}
            tasksUsage={tasksUsage}
            taskLimit={taskLimit.limit}
            aiCreditsUsage={aiCreditsUsage}
            aiCreditsLimit={aiCreditsLimit.limit}
          />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <DashboardActivityFeed items={activityFeed} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DashboardOrganizationCard
            organizationName={organizationName}
            members={organization?.members ?? []}
          />
        </div>
      </div>
    </div>
  );
}

function ChecklistStrip({
  items,
}: {
  items: { id: string; title: string; href: string; done: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-dashed border-brand/40 bg-brand/5 px-4 py-3">
      <p className="label-mono text-brand">Next up</p>
      <div className="flex flex-wrap gap-2 items-center">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1 text-xs transition-colors hover:border-brand hover:text-brand"
          >
            {item.title}
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
        <Link
          href={routes.app.tasks}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          or skip setup
        </Link>
      </div>
    </div>
  );
}
