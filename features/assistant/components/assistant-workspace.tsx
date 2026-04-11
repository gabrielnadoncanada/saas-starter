"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AssistantChat } from "@/features/assistant/components/assistant-chat";
import type { AssistantConversation } from "@/features/assistant/schemas/conversation-api.schema";
import { routes } from "@/shared/constants/routes";
import type { AiModelDefinition, AiModelId } from "@/shared/lib/ai/models";

type AssistantWorkspaceProps = {
  initialConversation: AssistantConversation | null;
  initialConversationId: string | null;
  initialDefaultModelId: AiModelId;
  initialModelOptions: AiModelDefinition[];
};

function buildConversationUrl(conversationId: string | null) {
  if (!conversationId) {
    return routes.app.assistant;
  }

  return `${routes.app.assistant}?conversationId=${conversationId}`;
}

export function AssistantWorkspace({
  initialConversation,
  initialConversationId,
  initialDefaultModelId,
  initialModelOptions,
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
    />
  );
}
