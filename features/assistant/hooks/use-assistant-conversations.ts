"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { routes } from "@/constants/routes";
import {
  deleteAssistantConversationRequest,
  listAssistantConversationsRequest,
} from "@/features/assistant/client/assistant-conversations-api";
import type { AssistantConversationListItem } from "@/features/assistant/schemas/conversation-api.schema";

export function useAssistantConversations() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");
  const [conversations, setConversations] = useState<
    AssistantConversationListItem[]
  >([]);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversations() {
      const next = await listAssistantConversationsRequest();
      if (!isCancelled) {
        setConversations(next);
      }
    }

    void loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [pathname, activeConversationId]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      setDeletingConversationId(conversationId);

      try {
        await deleteAssistantConversationRequest(conversationId);
        setConversations((current) =>
          current.filter((conversation) => conversation.id !== conversationId),
        );

        if (activeConversationId === conversationId) {
          router.replace(routes.app.assistant, { scroll: false });
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to delete conversation",
        );
      } finally {
        setDeletingConversationId(null);
      }
    },
    [activeConversationId, router],
  );

  return {
    conversations,
    activeConversationId,
    deletingConversationId,
    deleteConversation,
  };
}
