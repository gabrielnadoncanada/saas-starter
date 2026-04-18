import { redirect } from "next/navigation";

import { Page } from "@/components/layout/page-layout";
import { routes } from "@/constants/routes";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";
import { aiModels, defaultAiModelId } from "@/lib/ai/models";

type AssistantPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  if (!hasAnyAiProvider()) {
    redirect(routes.app.dashboard);
  }

  const entitlements = await getCurrentEntitlements();

  const canUseAssistant = entitlements
    ? hasCapability(entitlements, "ai.assistant")
    : false;

  const { conversationId } = await searchParams;

  const initialConversation =
    canUseAssistant && conversationId
      ? await getAssistantConversation(conversationId)
      : null;

  const modelOptions = entitlements && canUseAssistant ? [...aiModels] : [];

  return (
    <Page className="pb-0">
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
