import "server-only";

import type { UIMessage } from "ai";

import {
  appendPublicConversationMessages,
  getPublicConversation,
  setPublicConversationStatus,
} from "@/features/agents/server/public-conversations";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";

/**
 * Admin marks themselves as the human handling a conversation. Flips the
 * status to HUMAN and records the assignee. Future chat responses should come
 * from the human, not the model, until status is flipped back or RESOLVED.
 */
export async function takeOverConversation(conversationId: string) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const convo = await getPublicConversation(membership.organizationId, conversationId);
  if (!convo) throw new Error("Conversation not found");

  return setPublicConversationStatus({
    organizationId: membership.organizationId,
    conversationId,
    status: "HUMAN",
    assignedUserId: user.id,
  });
}

/**
 * Admin hands the conversation back to the bot. Preserves assignee for audit.
 */
export async function releaseConversationToBot(conversationId: string) {
  const membership = await requireActiveOrganizationMembership();
  const convo = await getPublicConversation(membership.organizationId, conversationId);
  if (!convo) throw new Error("Conversation not found");

  return setPublicConversationStatus({
    organizationId: membership.organizationId,
    conversationId,
    status: "BOT",
  });
}

export async function resolveConversation(conversationId: string) {
  const membership = await requireActiveOrganizationMembership();
  const convo = await getPublicConversation(membership.organizationId, conversationId);
  if (!convo) throw new Error("Conversation not found");

  return setPublicConversationStatus({
    organizationId: membership.organizationId,
    conversationId,
    status: "RESOLVED",
  });
}

/**
 * Appends a human-authored assistant message to the transcript. The visitor
 * sees it on their next poll/SSE event.
 */
export async function sendHumanReply(params: {
  conversationId: string;
  message: string;
}) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const convo = await getPublicConversation(
    membership.organizationId,
    params.conversationId,
  );
  if (!convo) throw new Error("Conversation not found");

  const existing = Array.isArray(convo.messagesJson)
    ? (convo.messagesJson as unknown as UIMessage[])
    : [];

  const humanMessage: UIMessage = {
    id: `human-${Date.now()}`,
    role: "assistant",
    parts: [{ type: "text", text: params.message }],
    metadata: {
      sender: "human",
      authorUserId: user.id,
      sentAt: new Date().toISOString(),
    } as Record<string, unknown>,
  } as UIMessage;

  return appendPublicConversationMessages({
    organizationId: membership.organizationId,
    conversationId: params.conversationId,
    messages: [...existing, humanMessage],
  });
}
