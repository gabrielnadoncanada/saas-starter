import "server-only";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

export async function listAgentConversations(agentId: string, take = 50) {
  await requireActiveOrganizationMembership();
  return db.publicConversation.findMany({
    where: { agentId },
    orderBy: { lastMessageAt: "desc" },
    take,
    include: {
      lead: { select: { id: true, contactEmail: true, contactName: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAgentConversation(conversationId: string) {
  await requireActiveOrganizationMembership();
  return db.publicConversation.findFirst({
    where: { id: conversationId },
    include: {
      lead: true,
      assignedUser: { select: { id: true, name: true, email: true } },
      agent: { select: { id: true, slug: true, name: true } },
    },
  });
}

export async function listAgentLeads(agentId: string, take = 50) {
  await requireActiveOrganizationMembership();
  return db.lead.findMany({
    where: { conversation: { agentId } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      conversation: { select: { id: true, visitorId: true } },
    },
  });
}
