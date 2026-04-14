import { DashboardAiAssistantCard } from "@/features/dashboard/components/dashboard-ai-assistant-card";
import { DashboardCurrentPlanCard } from "@/features/dashboard/components/dashboard-current-plan-card";
import { DashboardGettingStartedCard } from "@/features/dashboard/components/dashboard-getting-started-card";
import { DashboardMembersCard } from "@/features/dashboard/components/dashboard-members-card";
import { DashboardPlanAiEntitlementsCard } from "@/features/dashboard/components/dashboard-plan-ai-entitlements-card";
import { DashboardRecentTasksCard } from "@/features/dashboard/components/dashboard-recent-tasks-card";
import { DashboardUsageLimitsCard } from "@/features/dashboard/components/dashboard-usage-limits-card";
import { DashboardWorkspacePulseCard } from "@/features/dashboard/components/dashboard-workspace-pulse-card";
import type { DashboardOverviewData } from "@/features/dashboard/server/get-dashboard-overview";

type DashboardOverviewProps = {
  overview: DashboardOverviewData;
};

export function DashboardOverview({ overview }: DashboardOverviewProps) {
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
    checklist,
  } = overview;
  const workspaceName = organization?.name ?? "your workspace";
  const completedChecklistCount = checklist.filter((item) => item.done).length;

  return (
    <div className="grid gap-4 grid-cols-12">
      <div className="col-span-12 xl:col-span-8">
        <DashboardWorkspacePulseCard
          planName={plan.name}
          workspaceName={workspaceName}
          memberCount={memberCount}
          taskCount={taskCount}
          completedChecklistCount={completedChecklistCount}
          checklistCount={checklist.length}
          canUseAI={canUseAI}
          assistantConversationCount={assistantConversationCount}
          tasksUsage={tasksUsage}
          aiCreditsUsage={aiCreditsUsage}
        />
      </div>
      <div className="col-span-12 xl:col-span-4">
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
      <div className="col-span-12 xl:col-span-4">
        <DashboardUsageLimitsCard
          tasksUsage={tasksUsage}
          taskLimit={taskLimit.limit}
          aiCreditsUsage={aiCreditsUsage}
          aiCreditsLimit={aiCreditsLimit.limit}
        />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <DashboardMembersCard members={organization?.members ?? []} />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <DashboardRecentTasksCard
          tasks={recentTasks}
          workspaceName={workspaceName}
        />
        <DashboardGettingStartedCard items={checklist} />
      </div>
      <div className="col-span-12 xl:col-span-8">
        <DashboardPlanAiEntitlementsCard
          aiCreditsUsage={aiCreditsUsage}
          aiCreditsLimit={aiCreditsLimit.limit}
          entitlements={entitlements}
          planName={plan.name}
          taskLimit={taskLimit.limit}
        />
      </div>
      <div className="col-span-12 xl:col-span-8">
        {canUseAI ? (
          <DashboardAiAssistantCard
            assistantConversationCount={assistantConversationCount}
          />
        ) : null}
      </div>
    </div>
  );
}
