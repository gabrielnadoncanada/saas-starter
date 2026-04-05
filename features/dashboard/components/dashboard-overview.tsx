import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { getPlanDisplayPrice } from "@/features/billing/catalog";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import { hasCapability } from "@/features/billing/plan-guards";
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

function formatPlanPrice(unitAmount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

export async function DashboardOverview() {
  const {
    organization,
    entitlements,
    planId,
    plan,
    memberCount,
    taskCount,
    tasksUsage,
    assistantConversationCount,
    taskLimit,
    canUseAI,
    recentTasks,
    usageChart,
    checklist,
  } = await getDashboardOverview();

  const activeInterval =
    organization?.billingInterval &&
    getPlanDisplayPrice(plan.id, organization.billingInterval)
      ? organization.billingInterval
      : getPlanDisplayPrice(plan.id, "month")
        ? "month"
        : getPlanDisplayPrice(plan.id, "year")
          ? "year"
          : null;
  const activePrice = activeInterval
    ? getPlanDisplayPrice(plan.id, activeInterval)
    : null;
  const priceLabel = activePrice
    ? formatPlanPrice(activePrice.unitAmount, "en")
    : "Free";
  const organizationNameSuffix = organization?.name
    ? ` ${organization.name}`
    : "";
  const workspaceName = organization?.name ?? "your workspace";

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>
          {`Welcome back${organizationNameSuffix}.`}
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
              label={"Monthly quota"}
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

        {canUseAI ? (
          <Card>
            <CardHeader>
              <CardDescription>AI Assistant</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-orange-500" />
                {assistantConversationCount > 0 ? "In use" : "Ready"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {assistantConversationCount > 0
                  ? `${assistantConversationCount} conversation${assistantConversationCount === 1 ? "" : "s"} in this workspace.`
                  : "Open the assistant to start a conversation."}
              </p>
            </CardContent>
          </Card>
        ) : null}
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
              Use this checklist to turn the starter into a real workspace
              quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOnboardingChecklist items={checklist} />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent tasks</CardTitle>
            <CardDescription>
              {`The latest task work happening in ${workspaceName}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentTasks tasks={recentTasks} />
          </CardContent>
        </Card>
      </div>

      {!entitlements || !hasCapability(entitlements, "team.analytics") ? (
        <UpgradeCard
          feature={"Organization Analytics"}
          description={
            "Upgrade your plan to access advanced analytics for your organization."
          }
        />
      ) : null}

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
      </div>
    </Page>
  );
}
