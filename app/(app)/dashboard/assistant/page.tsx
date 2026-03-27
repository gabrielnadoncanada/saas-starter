import { Page } from "@/shared/components/layout/page";
import { resolveTeamPlan } from "@/features/billing/plans";
import { hasCapability, checkLimit } from "@/features/billing/guards";
import { getMonthlyUsage } from "@/features/billing/usage";
import { getCurrentOrganization } from "@/features/teams/server/current-organization";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { getAssistantConversation } from "@/features/assistant/server/conversations";

type AssistantPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  const organization = await getCurrentOrganization();
  const planId = resolveTeamPlan(organization);
  const canUseAssistant = hasCapability(planId, "ai.assistant");
  const { conversationId } = await searchParams;

  const aiUsage = organization
    ? await getMonthlyUsage(organization.id, "aiRequestsPerMonth")
    : 0;
  const aiLimit = checkLimit(planId, "aiRequestsPerMonth", aiUsage);
  const initialConversation =
    canUseAssistant && aiLimit.allowed && conversationId
      ? await getAssistantConversation(conversationId)
      : null;

  return (
    <Page fixed>
      <div className="flex flex-col ">
        {!canUseAssistant ? (
          <UpgradeCard
            feature="AI Assistant"
            description="The AI assistant is available on Pro and Team plans. Upgrade to unlock the AI-ready monetization module with real task actions, demo inbox review, and invoice drafts."
          />
        ) : !aiLimit.allowed ? (
          <UpgradeCard
            feature="AI Assistant"
            description={`You've used all ${aiLimit.limit} AI requests this month. Upgrade your plan for a higher limit, or wait until next month.`}
          />
        ) : (
          <AssistantWorkspace
            initialConversation={initialConversation}
            initialConversationId={initialConversation?.id ?? null}
          />
        )}
      </div>
    </Page>
  );
}
