import "server-only";

import { cache } from "react";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

export const listAgents = cache(async () => {
  await requireActiveOrganizationMembership();
  return db.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          publicConversations: true,
          versions: true,
          knowledgeDocuments: true,
        },
      },
    },
  });
});

export async function getAgentById(agentId: string) {
  await requireActiveOrganizationMembership();
  return db.agent.findFirst({
    where: { id: agentId },
    include: {
      versions: { orderBy: { version: "desc" } },
      organization: { select: { slug: true } },
      _count: { select: { publicConversations: true, knowledgeDocuments: true } },
    },
  });
}

export async function getAgentVersions(agentId: string) {
  await requireActiveOrganizationMembership();
  const agent = await db.agent.findFirst({ where: { id: agentId }, select: { id: true } });
  if (!agent) return [];
  return db.agentVersion.findMany({
    where: { agentId },
    orderBy: { version: "desc" },
  });
}
