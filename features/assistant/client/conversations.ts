import type { UIMessage } from "ai";

import type {
  AssistantConversation,
  AssistantConversationListItem,
} from "@/features/assistant/types";

async function parseConversationResponse<T>(response: Response) {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const errorText = await response.text();
  throw new Error(errorText || "Unable to load conversation");
}

export async function fetchAssistantConversation(conversationId: string) {
  const response = await fetch(`/api/assistant/conversations/${conversationId}`);
  return parseConversationResponse<AssistantConversation>(response);
}

export async function createAssistantConversationRequest(messages: UIMessage[]) {
  const response = await fetch("/api/assistant/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return parseConversationResponse<AssistantConversation>(response);
}

export async function replaceAssistantConversationRequest(
  conversationId: string,
  messages: UIMessage[]
) {
  const response = await fetch(`/api/assistant/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return parseConversationResponse<AssistantConversation>(response);
}

export async function deleteAssistantConversationRequest(conversationId: string) {
  const response = await fetch(`/api/assistant/conversations/${conversationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to delete conversation");
  }
}

export function upsertConversationListItem(
  conversations: AssistantConversationListItem[],
  conversation: AssistantConversation
) {
  const nextItem: AssistantConversationListItem = {
    id: conversation.id,
    title: conversation.title,
    preview: conversation.preview,
    lastMessageAt: conversation.lastMessageAt,
  };

  return [nextItem, ...conversations.filter((item) => item.id !== conversation.id)];
}
