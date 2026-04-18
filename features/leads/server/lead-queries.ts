import "server-only";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";
import { LeadStatus } from "@/lib/db/enums";

export async function listLeads(filters?: {
  status?: LeadStatus;
  assignedUserId?: string;
  limit?: number;
}) {
  await requireActiveOrganizationMembership();
  return db.lead.findMany({
    where: {
      status: filters?.status,
      assignedUserId: filters?.assignedUserId,
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
    include: {
      assignedUser: { select: { id: true, name: true, email: true, image: true } },
      conversation: { select: { id: true, agentId: true } },
    },
  });
}

export async function getLeadById(leadId: string) {
  await requireActiveOrganizationMembership();
  return db.lead.findFirst({
    where: { id: leadId },
    include: {
      assignedUser: { select: { id: true, name: true, email: true, image: true } },
      conversation: true,
    },
  });
}
