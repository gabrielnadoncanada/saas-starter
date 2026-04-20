import { redirect } from "next/navigation";

import { Page } from "@/components/layout/page-layout";
import { billingConfig, type PlanId } from "@/config/billing.config";
import { routes } from "@/constants/routes";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import { getAssistantConversation } from "@/features/assistant/server/assistant-conversations";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { hasCapability } from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";
import { aiModels, defaultAiModelId } from "@/lib/ai/models";

function getNextPaidPlan(currentPlanId: PlanId) {
  const plans = billingConfig.plans;
  const currentIndex = plans.findIndex((plan) => plan.id === currentPlanId);

  for (let i = currentIndex + 1; i < plans.length; i++) {
    const plan = plans[i];
    if (plan.id !== "free" && plan.intervalPricing.month) {
      return plan;
    }
  }

  return null;
}

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
  const nextPlan = entitlements ? getNextPaidPlan(entitlements.planId) : null;
  const upgradeBillingInterval = entitlements?.billingInterval ?? "month";

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
          currentPlanName={entitlements?.planName ?? "Free"}
          initialDefaultModelId={defaultAiModelId}
          initialConversation={initialConversation}
          initialConversationId={initialConversation?.id ?? null}
          initialModelOptions={modelOptions}
          upgradeBillingInterval={upgradeBillingInterval}
          upgradePlanId={nextPlan?.id ?? null}
          upgradePlanName={nextPlan?.name ?? null}
        />
      )}
    </Page>
  );
}
