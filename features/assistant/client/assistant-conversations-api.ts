import { safeValidateUIMessages, type UIMessage } from "ai";

import {
  type AssistantConversation,
  type AssistantConversationListItem,
  assistantConversationEnvelopeSchema,
  assistantConversationListSchema,
} from "@/features/assistant/schemas/conversation-api.schema";

async function readConversationResponse(
  response: Response,
): Promise<AssistantConversation> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load conversation");
  }

  const payload = await response.json();
  const envelope = assistantConversationEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    throw new Error("Invalid response");
  }

  const rawMessages = (payload as { messages?: unknown }).messages;
  const validated = await safeValidateUIMessages({
    messages: Array.isArray(rawMessages) ? rawMessages : [],
  });
  if (!validated.success) {
    throw new Error("Invalid response");
  }

  return { ...envelope.data, messages: validated.data };
}

export async function listAssistantConversationsRequest() {
  const response = await fetch("/api/assistant/conversations");
  if (!response.ok) return [];

  const parsed = assistantConversationListSchema.safeParse(
    await response.json(),
  );
  return parsed.success ? parsed.data : [];
}

export async function createAssistantConversationRequest(
  messages: UIMessage[],
) {
  const response = await fetch("/api/assistant/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return readConversationResponse(response);
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

  return readConversationResponse(response);
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
  conversations: AssistantConversationListItem[],
  conversation: AssistantConversation,
) {
  const nextItem: AssistantConversationListItem = {
    id: conversation.id,
    title: conversation.title,
    preview: conversation.preview,
    lastMessageAt: conversation.lastMessageAt,
  };

  return [
    nextItem,
    ...conversations.filter((item) => item.id !== conversation.id),
  ];
}
