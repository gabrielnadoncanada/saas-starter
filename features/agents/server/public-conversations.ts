import "server-only";

import type { Prisma, PublicConversationStatus } from "@prisma/client";
import type { UIMessage } from "ai";

import { db } from "@/lib/db/prisma";
import { runAsAdmin, runInTenantScope } from "@/lib/db/tenant-scope";

export type PublicConversationContext = {
  pageUrl?: string;
  referrer?: string;
  locale?: string;
  visitorIp?: string;
  visitorUserAgent?: string;
};

function serializeMessages(messages: UIMessage[]): Prisma.InputJsonValue {
  return messages as unknown as Prisma.InputJsonValue;
}

export async function getPublicConversation(
  organizationId: string,
  conversationId: string,
) {
  return runInTenantScope(organizationId, () =>
    db.publicConversation.findFirst({
      where: { id: conversationId },
      include: { lead: true, agent: { select: { id: true, slug: true, name: true } } },
    }),
  );
}

export async function createPublicConversation(params: {
  organizationId: string;
  agentId: string;
  agentVersionId: string | null;
  visitorId: string;
  messages: UIMessage[];
  context?: PublicConversationContext;
}) {
  const { organizationId, context, ...rest } = params;
  return runInTenantScope(organizationId, () =>
    db.publicConversation.create({
      data: {
        organizationId,
        agentId: rest.agentId,
        agentVersionId: rest.agentVersionId,
        visitorId: rest.visitorId,
        messagesJson: serializeMessages(rest.messages),
        pageUrl: context?.pageUrl,
        visitorIp: context?.visitorIp,
        visitorUserAgent: context?.visitorUserAgent,
        contextJson: context
          ? ({
              pageUrl: context.pageUrl,
              referrer: context.referrer,
              locale: context.locale,
            } as Prisma.InputJsonValue)
          : undefined,
        lastMessageAt: new Date(),
      },
    }),
  );
}

export async function appendPublicConversationMessages(params: {
  organizationId: string;
  conversationId: string;
  messages: UIMessage[];
}) {
  const { organizationId, conversationId, messages } = params;
  return runInTenantScope(organizationId, () =>
    db.publicConversation.update({
      where: { id: conversationId },
      data: {
        messagesJson: serializeMessages(messages),
        lastMessageAt: new Date(),
      },
    }),
  );
}

export async function setPublicConversationStatus(params: {
  organizationId: string;
  conversationId: string;
  status: PublicConversationStatus;
  assignedUserId?: string | null;
}) {
  const { organizationId, conversationId, status, assignedUserId } = params;
  return runInTenantScope(organizationId, () =>
    db.publicConversation.update({
      where: { id: conversationId },
      data: {
        status,
        assignedUserId: assignedUserId ?? undefined,
        takenOverAt: status === "HUMAN" ? new Date() : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    }),
  );
}

/**
 * Public endpoint helper: given only a conversation id + visitor id, fetches
 * the conversation if it belongs to this visitor. Uses admin scope because
 * the visitor has no session.
 */
export async function getPublicConversationForVisitor(
  conversationId: string,
  visitorId: string,
) {
  return runAsAdmin(() =>
    db.publicConversation.findFirst({
      where: { id: conversationId, visitorId },
    }),
  );
}
