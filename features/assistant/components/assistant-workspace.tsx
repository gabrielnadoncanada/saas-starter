"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
  BillingInterval,
  PlanId,
} from "@/config/billing.config";
import { routes } from "@/constants/routes";
import { AssistantChat } from "@/features/assistant/components/assistant-chat";
import type { AssistantConversation } from "@/features/assistant/schemas/conversation-api.schema";
import type { AiModelDefinition, AiModelId } from "@/lib/ai/models";

type AssistantWorkspaceProps = {
  currentPlanName: string;
  initialConversation: AssistantConversation | null;
  initialConversationId: string | null;
  initialDefaultModelId: AiModelId;
  initialModelOptions: AiModelDefinition[];
  upgradeBillingInterval: BillingInterval;
  upgradePlanId: PlanId | null;
  upgradePlanName: string | null;
};

function buildConversationUrl(conversationId: string | null) {
  if (!conversationId) {
    return routes.app.assistant;
  }

  return `${routes.app.assistant}?conversationId=${conversationId}`;
}

export function AssistantWorkspace({
  currentPlanName,
  initialConversation,
  initialConversationId,
  initialDefaultModelId,
  initialModelOptions,
  upgradeBillingInterval,
  upgradePlanId,
  upgradePlanName,
}: AssistantWorkspaceProps) {
  const router = useRouter();
  const pendingConversationIdRef = useRef<string | null>(null);
  const selectedConversationIdRef = useRef<string | null>(
    initialConversationId,
  );
  const [chatResetKey, setChatResetKey] = useState(0);
  const [selectedConversation, setSelectedConversation] =
    useState<AssistantConversation | null>(initialConversation);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId);

  const replaceConversationUrl = (conversationId: string | null) => {
    pendingConversationIdRef.current = conversationId;
    router.replace(buildConversationUrl(conversationId), {
      scroll: false,
    });
  };

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    if (
      pendingConversationIdRef.current &&
      initialConversationId === pendingConversationIdRef.current
    ) {
      pendingConversationIdRef.current = null;
      return;
    }

    if (selectedConversationIdRef.current === initialConversationId) {
      return;
    }

    setSelectedConversation(initialConversation);
    setSelectedConversationId(initialConversationId);
    setChatResetKey((value) => value + 1);
  }, [initialConversation, initialConversationId]);

  return (
    <AssistantChat
      conversationId={selectedConversationId}
      currentPlanName={currentPlanName}
      defaultModelId={initialDefaultModelId}
      initialMessages={selectedConversation?.messages ?? []}
      modelOptions={initialModelOptions}
      onConversationCreated={(conversation) => {
        setSelectedConversation(conversation);
        setSelectedConversationId(conversation.id);
        replaceConversationUrl(conversation.id);
      }}
      onConversationUpdated={(conversation) => {
        setSelectedConversation((current) =>
          current?.id === conversation.id ? conversation : current,
        );
      }}
      resetKey={chatResetKey}
      upgradeBillingInterval={upgradeBillingInterval}
      upgradePlanId={upgradePlanId}
      upgradePlanName={upgradePlanName}
    />
  );
}
