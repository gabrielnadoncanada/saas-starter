import { Sparkles } from "lucide-react";

import { Main } from "@/shared/components/layout/shell/main";
import { resolveTeamPlan } from "@/features/billing/plans";
import { hasCapability, checkLimit } from "@/features/billing/guards";
import { getMonthlyUsage } from "@/features/billing/usage";
import { getCurrentOrganization } from "@/features/teams/server/current-organization";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";
import {
  getAssistantConversation,
  listAssistantConversations,
} from "@/features/assistant/server/conversations";

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
  const initialConversations =
    canUseAssistant && aiLimit.allowed ? await listAssistantConversations() : [];
  const initialConversation =
    canUseAssistant && aiLimit.allowed && conversationId
      ? await getAssistantConversation(conversationId)
      : null;

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            AI Assistant
          </h2>
          <p className="text-muted-foreground">
            Review the demo inbox, create real tasks, and draft invoices with AI.
          </p>
        </div>
        {canUseAssistant && (
          <div className="w-48 hidden sm:block">
            <UsageMeter
              label="AI requests"
              current={aiUsage}
              limit={aiLimit.limit}
            />
          </div>
        )}
      </div>

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
          initialConversations={initialConversations}
        />
      )}
    </Main>
  );
}
