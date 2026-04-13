import "server-only";

import { Prisma } from "@prisma/client";
import { safeValidateUIMessages, type UIMessage } from "ai";

import type {
  AssistantConversation,
  AssistantConversationListItem,
} from "@/features/assistant/schemas/conversation-api.schema";
import { assistantConversationSurface } from "@/features/assistant/types";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db/prisma";

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

function getConversationTitle(messages: UIMessage[]) {
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

function serializeMessages(messages: UIMessage[]): Prisma.InputJsonValue {
  return messages as unknown as Prisma.InputJsonValue;
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

const assistantConversationSelect = {
  id: true,
  title: true,
  messagesJson: true,
  lastMessageAt: true,
} as const satisfies Prisma.AiConversationSelect;

type ConversationRecord = Prisma.AiConversationGetPayload<{
  select: typeof assistantConversationSelect;
}>;

async function toConversationListItem(
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

async function toConversation(
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

type AssistantConversationScope =
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "ok"; organizationId: string; userId: string };

export async function resolveAssistantConversationScope(): Promise<AssistantConversationScope> {
  const user = await getCurrentUser();
  if (!user) {
    return { kind: "unauthorized" };
  }

  const organization = await getCurrentOrganization();
  if (!organization) {
    return { kind: "forbidden" };
  }

  return { kind: "ok", organizationId: organization.id, userId: user.id };
}

function getConversationWhere(
  scope: Extract<AssistantConversationScope, { kind: "ok" }>,
  conversationId?: string,
) {
  return {
    ...(conversationId ? { id: conversationId } : {}),
    organizationId: scope.organizationId,
    createdByUserId: scope.userId,
    surface: assistantConversationSurface,
  };
}

export async function listAssistantConversations() {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return [];
  }

  const records = await db.aiConversation.findMany({
    where: getConversationWhere(scope),
    orderBy: { lastMessageAt: "desc" },
    select: assistantConversationSelect,
  });

  return Promise.all(records.map(toConversationListItem));
}

export async function getAssistantConversation(conversationId: string) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.aiConversation.findFirst({
    where: getConversationWhere(scope, conversationId),
    select: assistantConversationSelect,
  });

  return record ? toConversation(record) : null;
}

export async function createAssistantConversation(messages: UIMessage[]) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.aiConversation.create({
    data: {
      organizationId: scope.organizationId,
      createdByUserId: scope.userId,
      surface: assistantConversationSurface,
      title: getConversationTitle(messages),
      messagesJson: serializeMessages(messages),
      lastMessageAt: new Date(),
    },
    select: assistantConversationSelect,
  });

  return toConversation(record);
}

export async function replaceAssistantConversation(
  conversationId: string,
  messages: UIMessage[],
) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const existing = await db.aiConversation.findFirst({
    where: getConversationWhere(scope, conversationId),
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const record = await db.aiConversation.update({
    where: { id: conversationId },
    data: {
      title: getConversationTitle(messages),
      messagesJson: serializeMessages(messages),
      lastMessageAt: new Date(),
    },
    select: assistantConversationSelect,
  });

  return toConversation(record);
}

export async function deleteAssistantConversation(conversationId: string) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return false;
  }

  const result = await db.aiConversation.deleteMany({
    where: getConversationWhere(scope, conversationId),
  });

  return result.count > 0;
}
