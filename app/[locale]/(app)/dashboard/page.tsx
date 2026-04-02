import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";

import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import { hasCapability } from "@/features/billing/guards/plan-guards";
import { DashboardActivityFeed } from "@/features/dashboard/components/dashboard-activity-feed";
import { DashboardOnboardingChecklist } from "@/features/dashboard/components/dashboard-onboarding-checklist";
import { DashboardRecentTasks } from "@/features/dashboard/components/dashboard-recent-tasks";
import { DashboardUsageChart } from "@/features/dashboard/components/dashboard-usage-chart";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

function formatPlanPrice(unitAmount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

export default async function DashboardPage() {
  const {
    organization,
    planId,
    plan,
    memberCount,
    taskCount,
    tasksUsage,
    aiUsage,
    taskLimit,
    aiLimit,
    canUseAI,
    recentActivity,
    recentTasks,
    usageChart,
    checklist,
    apiKeyCount,
  } = await getDashboardOverview();

  const activeInterval =
    organization?.billingInterval && plan.prices[organization.billingInterval]
      ? organization.billingInterval
      : plan.prices.month
        ? "month"
        : plan.prices.year
          ? "year"
          : null;
  const activePrice = activeInterval ? plan.prices[activeInterval] : null;
  const priceLabel = activePrice
    ? formatPlanPrice(activePrice.unitAmount)
    : "Free";

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>
          Welcome back{organization?.name ? ` to ${organization.name}` : ""}.
        </PageDescription>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {plan.name}
              <span className="ml-2 inline-flex items-center rounded-full border border-transparent px-2 py-1 text-xs text-green-500">
                <ArrowUp className="mr-1 size-3" />
                {planId}
              </span>
            </CardTitle>
            <CardDescription>Current Plan</CardDescription>
            <div className="font-heading text-2xl font-semibold">
              {priceLabel}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Task creations this month</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
              {taskCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageMeter
              label="Monthly quota"
              current={tasksUsage}
              limit={taskLimit.limit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Organization Members</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-5 w-5 text-orange-500" />
              {memberCount}
            </CardTitle>
          </CardHeader>
        </Card>

        {canUseAI && (
          <Card>
            <CardHeader>
              <CardDescription>AI Assistant</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-orange-500" />
                {aiUsage} requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageMeter
                label="Monthly quota"
                current={aiUsage}
                limit={aiLimit.limit}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Task activity this week</CardTitle>
            <CardDescription>
              A quick view of how much work is landing in the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardUsageChart data={usageChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
            <CardDescription>
              Use this checklist to turn the starter into a real workspace quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOnboardingChecklist items={checklist} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent tasks</CardTitle>
            <CardDescription>
              The latest task work happening in {organization?.name ?? "your workspace"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentTasks tasks={recentTasks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
            <CardDescription>
              Audit-backed events across tasks, invitations, keys, and security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardActivityFeed activity={recentActivity} />
          </CardContent>
        </Card>
      </div>

      {!hasCapability(planId, "team.analytics") && (
        <UpgradeCard
          feature="Organization Analytics"
          description="Upgrade your plan to access advanced analytics for your organization."
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link href={routes.app.tasks}>
          <Button variant="outline">
            View Tasks
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.app.assistant}>
          <Button variant="outline">
            AI Assistant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.settings.organization}>
          <Button variant="outline">
            Organization Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        {hasCapability(planId, "api.access") && (
          <Link href={routes.settings.apiKeys}>
            <Button variant="outline">
              API Keys ({apiKeyCount})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </Page>
  );
}
