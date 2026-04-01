import "server-only";

import type { Prisma } from "@prisma/client";
import { safeValidateUIMessages, type UIMessage } from "ai";

import type {
  AssistantConversation,
  AssistantConversationListItem,
} from "@/features/assistant/types";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

const DEFAULT_TITLE = "New conversation";
const TITLE_MAX_LENGTH = 72;
const PREVIEW_MAX_LENGTH = 96;

type ConversationScope =
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "ok"; userId: string; organizationId: string };

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

async function toConversationListItem(record: {
  id: string;
  title: string;
  messagesJson: Prisma.JsonValue;
  lastMessageAt: Date;
}): Promise<AssistantConversationListItem> {
  const messages = await parseMessages(record.messagesJson);

  return {
    id: record.id,
    title: record.title,
    preview: getConversationPreview(messages),
    lastMessageAt: record.lastMessageAt.toISOString(),
  };
}

async function toConversation(record: {
  id: string;
  title: string;
  messagesJson: Prisma.JsonValue;
  lastMessageAt: Date;
}): Promise<AssistantConversation> {
  const messages = await parseMessages(record.messagesJson);

  return {
    id: record.id,
    title: record.title,
    messages,
    preview: getConversationPreview(messages),
    lastMessageAt: record.lastMessageAt.toISOString(),
  };
}

export async function resolveAssistantConversationScope(): Promise<ConversationScope> {
  const user = await getCurrentUser();
  if (!user) {
    return { kind: "unauthorized" };
  }

  const organization = await getCurrentOrganization();
  if (!organization) {
    return { kind: "forbidden" };
  }

  return { kind: "ok", userId: user.id, organizationId: organization.id };
}

export async function listAssistantConversations() {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return [];
  }

  const records = await db.assistantConversation.findMany({
    where: { organizationId: scope.organizationId, userId: scope.userId },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      title: true,
      messagesJson: true,
      lastMessageAt: true,
    },
  });

  return Promise.all(records.map(toConversationListItem));
}

export async function getAssistantConversation(conversationId: string) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.assistantConversation.findFirst({
    where: {
      id: conversationId,
      organizationId: scope.organizationId,
      userId: scope.userId,
    },
    select: {
      id: true,
      title: true,
      messagesJson: true,
      lastMessageAt: true,
    },
  });

  return record ? toConversation(record) : null;
}

export async function createAssistantConversation(messages: UIMessage[]) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.assistantConversation.create({
    data: {
      organizationId: scope.organizationId,
      userId: scope.userId,
      title: getConversationTitle(messages),
      messagesJson: serializeMessages(messages),
      lastMessageAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      messagesJson: true,
      lastMessageAt: true,
    },
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

  const existing = await db.assistantConversation.findFirst({
    where: {
      id: conversationId,
      organizationId: scope.organizationId,
      userId: scope.userId,
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const record = await db.assistantConversation.update({
    where: { id: conversationId },
    data: {
      title: getConversationTitle(messages),
      messagesJson: serializeMessages(messages),
      lastMessageAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      messagesJson: true,
      lastMessageAt: true,
    },
  });

  return toConversation(record);
}

export async function deleteAssistantConversation(conversationId: string) {
  const scope = await resolveAssistantConversationScope();
  if (scope.kind !== "ok") {
    return false;
  }

  const result = await db.assistantConversation.deleteMany({
    where: {
      id: conversationId,
      organizationId: scope.organizationId,
      userId: scope.userId,
    },
  });

  return result.count > 0;
}
