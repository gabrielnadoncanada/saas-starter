import { Prisma } from "@prisma/client";
import { safeValidateUIMessages, type UIMessage } from "ai";

import type {
  AssistantConversation,
  AssistantConversationListItem,
} from "@/features/assistant/types";

const DEFAULT_TITLE = "New conversation";
const TITLE_MAX_LENGTH = 72;
const PREVIEW_MAX_LENGTH = 96;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function getMessageText(message: UIMessage) {
  return normalizeText(
    message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" "),
  );
}

export function getConversationTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const title = firstUserMessage ? getMessageText(firstUserMessage) : "";

  return title ? truncateText(title, TITLE_MAX_LENGTH) : DEFAULT_TITLE;
}

function getConversationPreview(messages: UIMessage[]) {
  for (const message of [...messages].reverse()) {
    const text = getMessageText(message);
    if (text) {
      return truncateText(text, PREVIEW_MAX_LENGTH);
    }
  }

  return null;
}

export function serializeMessages(
  messages: UIMessage[],
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(messages));
}

async function parseMessages(messagesJson: Prisma.JsonValue) {
  if (!Array.isArray(messagesJson)) {
    return [];
  }

  const result = await safeValidateUIMessages<UIMessage>({
    messages: messagesJson,
  });

  return result.success ? result.data : [];
}

export const assistantConversationSelect = {
  id: true,
  title: true,
  messagesJson: true,
  lastMessageAt: true,
} as const satisfies Prisma.AiConversationSelect;

export type ConversationRecord = Prisma.AiConversationGetPayload<{
  select: typeof assistantConversationSelect;
}>;

export async function toConversationListItem(
  record: ConversationRecord,
): Promise<AssistantConversationListItem> {
  const messages = await parseMessages(record.messagesJson);

  return {
    id: record.id,
    title: record.title,
    preview: getConversationPreview(messages),
    lastMessageAt: record.lastMessageAt.toISOString(),
  };
}

export async function toConversation(
  record: ConversationRecord,
): Promise<AssistantConversation> {
  const messages = await parseMessages(record.messagesJson);

  return {
    id: record.id,
    title: record.title,
    messages,
    preview: getConversationPreview(messages),
    lastMessageAt: record.lastMessageAt.toISOString(),
  };
}
