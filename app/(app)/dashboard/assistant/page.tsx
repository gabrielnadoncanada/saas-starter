import { aiConversationSurfaces } from "@/features/ai/ai-surfaces";
import { getAiConversation } from "@/features/ai/server/ai-conversations";
import {
  getOrganizationAiSettings,
  listAllowedAiModelsForOrganization,
} from "@/features/ai/server/organization-ai-settings";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import {
  checkLimit,
  hasCapability,
} from "@/features/billing/guards/plan-guards";
import { resolveOrganizationPlan } from "@/features/billing/plans/resolve-organization-plan";
import { getMonthlyUsage } from "@/features/billing/usage/usage-service";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { Page } from "@/shared/components/layout/page-layout";

type AssistantPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  const organization = await getCurrentOrganization();
  const planId = resolveOrganizationPlan(organization);
  const canUseAssistant = hasCapability(planId, "ai.assistant");
  const { conversationId } = await searchParams;

  const aiUsage = organization
    ? await getMonthlyUsage(organization.id, "aiRequestsPerMonth")
    : 0;
  const aiLimit = checkLimit(planId, "aiRequestsPerMonth", aiUsage);
  const initialConversation =
    canUseAssistant && aiLimit.allowed && conversationId
      ? await getAiConversation(
          conversationId,
          aiConversationSurfaces.assistant,
        )
      : null;
  const aiSettings =
    organization && canUseAssistant && aiLimit.allowed
      ? await getOrganizationAiSettings(organization.id)
      : null;
  const modelOptions =
    organization && canUseAssistant && aiLimit.allowed
      ? await listAllowedAiModelsForOrganization(organization.id)
      : [];

  return (
    <Page fixed>
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
          initialDefaultModelId={
            aiSettings?.defaultModelId ?? modelOptions[0].id
          }
          initialConversation={initialConversation}
          initialConversationId={initialConversation?.id ?? null}
          initialModelOptions={modelOptions}
        />
      )}
    </Page>
  );
}
