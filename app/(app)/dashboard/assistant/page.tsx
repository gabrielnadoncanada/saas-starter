import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { Page } from "@/shared/components/layout/page-layout";
import { aiModels, defaultAiModelId } from "@/shared/lib/ai/models";

type AssistantPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  const entitlements = await getCurrentOrganizationEntitlements();
  const canUseAssistant = entitlements
    ? hasCapability(entitlements, "ai.assistant")
    : false;
  const { conversationId } = await searchParams;
  const initialConversation =
    canUseAssistant && conversationId
      ? await getAssistantConversation(conversationId)
      : null;
  const modelOptions =
    entitlements && canUseAssistant ? [...aiModels] : [];

  return (
    <Page fixed>
      {!canUseAssistant ? (
        <UpgradeCard
          feature={"AI Assistant"}
          description={
            "The AI assistant is available on Pro and Team plans. Upgrade to unlock the AI module with real task actions."
          }
        />
      ) : (
        <AssistantWorkspace
          initialDefaultModelId={defaultAiModelId}
          initialConversation={initialConversation}
          initialConversationId={initialConversation?.id ?? null}
          initialModelOptions={modelOptions}
        />
      )}
    </Page>
  );
}
