"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  deleteAssistantConversationRequest,
  fetchAssistantConversation,
  upsertConversationListItem,
} from "@/features/assistant/client/conversations";
import { AssistantChat } from "@/features/assistant/components/assistant-chat";
import { AssistantConversationHistory } from "@/features/assistant/components/assistant-conversation-history";
import type {
  AssistantConversation,
  AssistantConversationListItem,
} from "@/features/assistant/types";

type AssistantWorkspaceProps = {
  initialConversation: AssistantConversation | null;
  initialConversationId: string | null;
  initialConversations: AssistantConversationListItem[];
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
  initialConversations,
}: AssistantWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingConversationUrlRef = useRef<string | null | undefined>(undefined);
  const [chatResetKey, setChatResetKey] = useState(0);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<AssistantConversation | null>(initialConversation);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(initialConversationId);
  const [conversations, setConversations] =
    useState<AssistantConversationListItem[]>(initialConversations);

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
    setHistoryError(null);
    setIsLoadingConversation(true);

    try {
      const conversation = await fetchAssistantConversation(conversationId);
      setSelectedConversation(conversation);
      setSelectedConversationId(conversation.id);
      setConversations((current) =>
        upsertConversationListItem(current, conversation)
      );
      setChatResetKey((value) => value + 1);
      replaceConversationUrl(conversation.id);
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Unable to load conversation"
      );
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleNewConversation = () => {
    setHistoryError(null);
    resetChat();
    replaceConversationUrl(null);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setHistoryError(null);

    try {
      await deleteAssistantConversationRequest(conversationId);
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId)
      );

      if (conversationId === selectedConversationId) {
        resetChat();
        replaceConversationUrl(null);
      }
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Unable to delete conversation"
      );
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
    <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
      <div className="flex flex-col gap-3">
        <AssistantConversationHistory
          conversations={conversations}
          isLoadingConversation={isLoadingConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          onSelectConversation={(conversationId) => void loadConversation(conversationId)}
          selectedConversationId={selectedConversationId}
        />
        {historyError ? (
          <p className="text-sm text-destructive">{historyError}</p>
        ) : null}
      </div>

      <AssistantChat
        conversationId={selectedConversationId}
        initialMessages={selectedConversation?.messages ?? []}
        onConversationCreated={(conversation) => {
          setHistoryError(null);
          setSelectedConversation(conversation);
          setSelectedConversationId(conversation.id);
          setConversations((current) =>
            upsertConversationListItem(current, conversation)
          );
          replaceConversationUrl(conversation.id);
        }}
        onConversationUpdated={(conversation) => {
          setSelectedConversation((current) =>
            current?.id === conversation.id ? conversation : current
          );
          setConversations((current) =>
            upsertConversationListItem(current, conversation)
          );
        }}
        resetKey={chatResetKey}
      />
    </div>
  );
}
