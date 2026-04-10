import "server-only";

import type { UIMessage } from "ai";

import {
  assistantConversationSelect,
  getConversationTitle,
  serializeMessages,
  toConversation,
  toConversationListItem,
} from "@/features/assistant/server/assistant-conversation-messages";
import { assistantConversationSurface } from "@/features/assistant/types";
import { getCurrentOrganization } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

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
