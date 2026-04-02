import type { UIMessage } from "ai";

import type {
  AiConversation,
  AiConversationListItem,
} from "@/features/ai/types/ai.types";

async function parseConversationResponse<T>(response: Response) {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const errorText = await response.text();
  throw new Error(errorText || "Unable to load conversation");
}

export async function listAssistantConversationsRequest() {
  const response = await fetch("/api/assistant/conversations");
  if (!response.ok) return [];
  return (await response.json()) as AiConversationListItem[];
}

export async function fetchAssistantConversation(conversationId: string) {
  const response = await fetch(
    `/api/assistant/conversations/${conversationId}`,
  );
  return parseConversationResponse<AiConversation>(response);
}

export async function createAssistantConversationRequest(
  messages: UIMessage[],
) {
  const response = await fetch("/api/assistant/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return parseConversationResponse<AiConversation>(response);
}

export async function replaceAssistantConversationRequest(
  conversationId: string,
  messages: UIMessage[],
) {
  const response = await fetch(
    `/api/assistant/conversations/${conversationId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    },
  );

  return parseConversationResponse<AiConversation>(response);
}

export async function deleteAssistantConversationRequest(
  conversationId: string,
) {
  const response = await fetch(
    `/api/assistant/conversations/${conversationId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to delete conversation");
  }
}

export function upsertConversationListItem(
  conversations: AiConversationListItem[],
  conversation: AiConversation,
) {
  const nextItem: AiConversationListItem = {
    id: conversation.id,
    surface: conversation.surface,
    title: conversation.title,
    preview: conversation.preview,
    lastMessageAt: conversation.lastMessageAt,
  };

  return [
    nextItem,
    ...conversations.filter((item) => item.id !== conversation.id),
  ];
}
