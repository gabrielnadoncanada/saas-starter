import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/plan-guards";
import { DashboardCurrentPlanCard } from "@/features/dashboard/components/dashboard-current-plan-card";
import { DashboardMembersCard } from "@/features/dashboard/components/dashboard-members-card";
import { DashboardOnboardingChecklist } from "@/features/dashboard/components/dashboard-onboarding-checklist";
import { DashboardPlanAiEntitlementsCard } from "@/features/dashboard/components/dashboard-plan-ai-entitlements-card";
import { DashboardRecentTasks } from "@/features/dashboard/components/dashboard-recent-tasks";
import { DashboardUsageChart } from "@/features/dashboard/components/dashboard-usage-chart";
import { DashboardUsageLimitsCard } from "@/features/dashboard/components/dashboard-usage-limits-card";
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

export async function DashboardOverview() {
  const {
    organization,
    entitlements,
    planId,
    plan,
    tasksUsage,
    assistantConversationCount,
    taskLimit,
    aiCreditsUsage,
    aiCreditsLimit,
    canUseAI,
    recentTasks,
    usageChart,
    checklist,
  } = await getDashboardOverview();

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
        <DashboardCurrentPlanCard
          billingInterval={organization?.billingInterval ?? null}
          cancelAtPeriodEnd={organization?.cancelAtPeriodEnd ?? false}
          periodEnd={organization?.periodEnd ?? null}
          planId={planId}
          planName={plan.name}
          pricingModel={plan.pricingModel}
          subscriptionStatus={organization?.subscriptionStatus ?? null}
        />

        <DashboardUsageLimitsCard
          tasksUsage={tasksUsage}
          taskLimit={taskLimit.limit}
          aiCreditsUsage={aiCreditsUsage}
          aiCreditsLimit={aiCreditsLimit.limit}
        />

        <DashboardMembersCard members={organization?.members ?? []} />

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

      <DashboardPlanAiEntitlementsCard
        aiCreditsUsage={aiCreditsUsage}
        aiCreditsLimit={aiCreditsLimit.limit}
        entitlements={entitlements}
        planName={plan.name}
        taskLimit={taskLimit.limit}
      />

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
