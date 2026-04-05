"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchAssistantConversation } from "@/features/assistant/client/assistant-conversations-api";
import { AssistantChat } from "@/features/assistant/components/assistant-chat";
import type { AssistantConversation } from "@/features/assistant/types";
import type { AiModelId, AiModelOption } from "@/shared/lib/ai/models";

type AssistantWorkspaceProps = {
  initialConversation: AssistantConversation | null;
  initialConversationId: string | null;
  initialDefaultModelId: AiModelId;
  initialModelOptions: AiModelOption[];
};

function buildConversationUrl(pathname: string, conversationId: string | null) {
  if (!conversationId) {
    return pathname;
  }

  return `${pathname}?conversationId=${conversationId}`;
}

export function AssistantWorkspace({
  initialConversation,
  initialConversationId,
  initialDefaultModelId,
  initialModelOptions,
}: AssistantWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingConversationUrlRef = useRef<string | null | undefined>(
    undefined,
  );
  const [chatResetKey, setChatResetKey] = useState(0);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<AssistantConversation | null>(initialConversation);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId);

  const replaceConversationUrl = (conversationId: string | null) => {
    pendingConversationUrlRef.current = conversationId;
    router.replace(buildConversationUrl(pathname, conversationId), {
      scroll: false,
    });
  };

  const resetChat = () => {
    setSelectedConversation(null);
    setSelectedConversationId(null);
    setChatResetKey((value) => value + 1);
  };

  const loadConversation = async (conversationId: string) => {
    setIsLoadingConversation(true);

    try {
      const conversation = await fetchAssistantConversation(conversationId);
      setSelectedConversation(conversation);
      setSelectedConversationId(conversation.id);
      setChatResetKey((value) => value + 1);
      replaceConversationUrl(conversation.id);
    } catch {
      // Conversation loading is handled by sidebar navigation
    } finally {
      setIsLoadingConversation(false);
    }
  };

  useEffect(() => {
    const conversationId = searchParams.get("conversationId");

    if (pendingConversationUrlRef.current !== undefined) {
      if (conversationId !== pendingConversationUrlRef.current) {
        return;
      }

      pendingConversationUrlRef.current = undefined;
      return;
    }

    if (!conversationId && selectedConversationId) {
      resetChat();
      return;
    }

    if (
      conversationId &&
      conversationId !== selectedConversationId &&
      !isLoadingConversation
    ) {
      void loadConversation(conversationId);
    }
  }, [isLoadingConversation, searchParams, selectedConversationId]);

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
