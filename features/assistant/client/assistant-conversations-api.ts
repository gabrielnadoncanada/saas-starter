import type { UIMessage } from "ai";
import { z } from "zod";

import {
  type AssistantConversation,
  type AssistantConversationListItem,
  assistantConversationListSchema,
  assistantConversationSchema,
} from "@/features/assistant/schemas/conversation-api.schema";

async function parseConversationResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to load conversation");
  }

  const raw: unknown = await response.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid response");
  }

  return parsed.data;
}

export async function listAssistantConversationsRequest() {
  const response = await fetch("/api/assistant/conversations");
  if (!response.ok) return [];
  const raw: unknown = await response.json();
  const parsed = assistantConversationListSchema.safeParse(raw);
  if (!parsed.success) {
    return [];
  }
  return parsed.data;
}

export async function fetchAssistantConversation(conversationId: string) {
  const response = await fetch(
    `/api/assistant/conversations/${conversationId}`,
  );
  return await parseConversationResponse(
    response,
    assistantConversationSchema,
  ) as AssistantConversation;
}

export async function createAssistantConversationRequest(
  messages: UIMessage[],
) {
  const response = await fetch("/api/assistant/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return await parseConversationResponse(
    response,
    assistantConversationSchema,
  ) as AssistantConversation;
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

  return await parseConversationResponse(
    response,
    assistantConversationSchema,
  ) as AssistantConversation;
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
