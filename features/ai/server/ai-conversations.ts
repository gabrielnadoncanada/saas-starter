import "server-only";

import type { UIMessage } from "ai";

import {
  getConversationTitle,
  serializeMessages,
  toConversation,
  toConversationListItem,
} from "@/features/ai/server/ai-conversation-messages";
import type { AiConversationSurface } from "@/features/ai/types/ai.types";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

type AiConversationScope =
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "ok"; organizationId: string; userId: string };

export async function resolveAiConversationScope(): Promise<AiConversationScope> {
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
  scope: Extract<AiConversationScope, { kind: "ok" }>,
  surface: AiConversationSurface,
  conversationId?: string,
) {
  return {
    ...(conversationId ? { id: conversationId } : {}),
    organizationId: scope.organizationId,
    createdByUserId: scope.userId,
    surface,
  };
}

const conversationSelect = {
  id: true,
  surface: true,
  title: true,
  messagesJson: true,
  lastMessageAt: true,
} as const;

export async function listAiConversations(surface: AiConversationSurface) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return [];
  }

  const records = await db.aiConversation.findMany({
    where: getConversationWhere(scope, surface),
    orderBy: { lastMessageAt: "desc" },
    select: conversationSelect,
  });

  return Promise.all(records.map(toConversationListItem));
}

export async function getAiConversation(
  conversationId: string,
  surface: AiConversationSurface,
) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.aiConversation.findFirst({
    where: getConversationWhere(scope, surface, conversationId),
    select: conversationSelect,
  });

  return record ? toConversation(record) : null;
}

export async function createAiConversation(
  surface: AiConversationSurface,
  messages: UIMessage[],
) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const record = await db.aiConversation.create({
    data: {
      organizationId: scope.organizationId,
      createdByUserId: scope.userId,
      surface,
      title: getConversationTitle(messages),
      messagesJson: serializeMessages(messages),
      lastMessageAt: new Date(),
    },
    select: conversationSelect,
  });

  return toConversation(record);
}

export async function replaceAiConversation(
  conversationId: string,
  surface: AiConversationSurface,
  messages: UIMessage[],
) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return null;
  }

  const existing = await db.aiConversation.findFirst({
    where: getConversationWhere(scope, surface, conversationId),
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
    select: conversationSelect,
  });

  return toConversation(record);
}

export async function deleteAiConversation(
  conversationId: string,
  surface: AiConversationSurface,
) {
  const scope = await resolveAiConversationScope();
  if (scope.kind !== "ok") {
    return false;
  }

  const result = await db.aiConversation.deleteMany({
    where: getConversationWhere(scope, surface, conversationId),
  });

  return result.count > 0;
}
