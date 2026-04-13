import type { Task } from "@prisma/client";
import { ArrowRight, ListTodo, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/entitlements";
import { DashboardCurrentPlanCard } from "@/features/dashboard/components/dashboard-current-plan-card";
import { DashboardMembersCard } from "@/features/dashboard/components/dashboard-members-card";
import { DashboardOnboardingChecklist } from "@/features/dashboard/components/dashboard-onboarding-checklist";
import { DashboardPlanAiEntitlementsCard } from "@/features/dashboard/components/dashboard-plan-ai-entitlements-card";
import { DashboardUsageChart } from "@/features/dashboard/components/dashboard-usage-chart";
import { DashboardUsageLimitsCard } from "@/features/dashboard/components/dashboard-usage-limits-card";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";
import { taskPriorities, taskStatuses } from "@/features/tasks/task-display";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/shared/components/ui/item";
import { Separator } from "@/shared/components/ui/separator";
import { routes } from "@/shared/constants/routes";

function RecentTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <Empty className="min-h-0 border">
        <EmptyHeader>
          <EmptyTitle>No tasks yet</EmptyTitle>
          <EmptyDescription>
            Create one to start shaping the workspace.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-3">
      {tasks.map((task) => {
        const statusLabel = taskStatuses.find(
          (status) => status.value === task.status,
        )?.label;
        const priorityLabel = taskPriorities.find(
          (priority) => priority.value === task.priority,
        )?.label;

        return (
          <Item key={task.id} asChild variant="outline">
            <Link href={routes.app.tasks}>
              <ItemContent>
                <ItemHeader>
                  <ItemTitle>{task.title}</ItemTitle>
                  <ItemActions>
                    <Badge variant="outline">
                      {priorityLabel ?? task.priority}
                    </Badge>
                  </ItemActions>
                </ItemHeader>
                <ItemDescription>
                  {task.code} · {statusLabel ?? task.status}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        );
      })}
    </ItemGroup>
  );
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
  const completedChecklistCount = checklist.filter((item) => item.done).length;

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            {`Welcome back${organizationNameSuffix}.`}
          </PageDescription>
        </div>

        <PageHeaderActions className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.app.tasks}>
              View Tasks
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.app.assistant}>
              AI Assistant
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.settings.organization}>
              Organization Settings
              <ArrowRight />
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardDescription>Workspace pulse</CardDescription>
            <CardAction className="hidden sm:block">
              <Badge variant="secondary">{plan.name}</Badge>
            </CardAction>
            <CardTitle className="text-2xl">{workspaceName}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2 sm:hidden">
              <Badge variant="secondary">{plan.name}</Badge>
            </div>

            <p className="max-w-2xl text-sm text-muted-foreground">
              Keep the team moving with a clean view of plan health, usage, and
              the work landing in your workspace.
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{`${memberCount} member${memberCount === 1 ? "" : "s"}`}</Badge>
              <Badge variant="outline">{`${taskCount} task${taskCount === 1 ? "" : "s"}`}</Badge>
              <Badge variant="outline">{`${completedChecklistCount}/${checklist.length} onboarding done`}</Badge>
              {canUseAI ? (
                <Badge variant="outline">
                  {assistantConversationCount > 0
                    ? `${assistantConversationCount} AI conversation${assistantConversationCount === 1 ? "" : "s"}`
                    : "AI ready"}
                </Badge>
              ) : null}
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <Users className="size-5 text-primary" />
                  {memberCount}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Tasks this month
                </p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <ListTodo className="size-5 text-primary" />
                  {tasksUsage}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">AI credits used</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <Sparkles className="size-5 text-primary" />
                  {aiCreditsUsage}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DashboardCurrentPlanCard
          billingInterval={organization?.billingInterval ?? null}
          cancelAtPeriodEnd={organization?.cancelAtPeriodEnd ?? false}
          periodEnd={organization?.periodEnd ?? null}
          planId={planId}
          planName={plan.name}
          subscriptionStatus={organization?.subscriptionStatus ?? null}
          trialEnd={organization?.trialEnd ?? null}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
              <CardTitle className="text-2xl">
                {assistantConversationCount > 0 ? "In use" : "Ready"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {assistantConversationCount > 0
                  ? `${assistantConversationCount} conversation${assistantConversationCount === 1 ? "" : "s"} in this workspace.`
                  : "Open the assistant to start a conversation."}
              </p>
              <Badge variant="outline">
                {assistantConversationCount > 0
                  ? "Active workspace usage"
                  : "Included in your plan"}
              </Badge>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="secondary">
                <Link href={routes.app.assistant}>
                  Open assistant
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
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

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
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

        <Card className="xl:col-span-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
          <CardDescription>
            {`The latest task work happening in ${workspaceName}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTasks tasks={recentTasks} />
        </CardContent>
      </Card>

      {!entitlements || !hasCapability(entitlements, "team.analytics") ? (
        <UpgradeCard
          feature={"Organization Analytics"}
          description={
            "Upgrade your plan to access advanced analytics for your organization."
          }
        />
      ) : null}
    </Page>
  );
}
