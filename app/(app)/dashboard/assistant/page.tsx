import { getTranslations } from "next-intl/server";

import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import {
  getOrganizationAiSettings,
  listAllowedAiModelsForOrganization,
} from "@/features/assistant/server/organization-ai-settings";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/guards/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { Page } from "@/shared/components/layout/page-layout";

type AssistantPageProps = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function AssistantPage({
  searchParams,
}: AssistantPageProps) {
  const t = await getTranslations("assistant");
  const entitlements = await getCurrentOrganizationEntitlements();
  const canUseAssistant = entitlements
    ? hasCapability(entitlements, "ai.assistant")
    : false;
  const { conversationId } = await searchParams;
  const hasCredits = (entitlements?.creditBalance ?? 0) > 0;
  const initialConversation =
    canUseAssistant && hasCredits && conversationId
      ? await getAssistantConversation(conversationId)
      : null;
  const aiSettings =
    entitlements && canUseAssistant && hasCredits
      ? await getOrganizationAiSettings(entitlements.organizationId)
      : null;
  const modelOptions =
    entitlements && canUseAssistant && hasCredits
      ? await listAllowedAiModelsForOrganization(entitlements.organizationId)
      : [];

  return (
    <Page fixed>
      {!canUseAssistant ? (
        <UpgradeCard
          feature={"AI Assistant"}
          description={"The AI assistant is available on Pro and Team plans. Upgrade to unlock the AI-ready monetization module with real task actions, demo inbox review, and invoice drafts."}
        />
      ) : !hasCredits ? (
        <UpgradeCard
          feature={"AI Assistant"}
          description={t("upgrade.limitExceededDescription", {
            credits: entitlements?.creditBalance ?? 0,
          })}
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
