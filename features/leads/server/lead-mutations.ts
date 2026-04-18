import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  CreateLeadValues,
  UpdateLeadValues,
} from "@/features/leads/schemas/lead.schema";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";
import { LeadStatus } from "@/lib/db/enums";
import { runInTenantScope } from "@/lib/db/tenant-scope";

/**
 * Admin context: create a lead from an authenticated org member.
 */
export async function createLeadAsMember(input: CreateLeadValues) {
  const membership = await requireActiveOrganizationMembership();
  return db.lead.create({
    data: {
      organizationId: membership.organizationId,
      data: input.data as Prisma.InputJsonValue,
      score: input.score,
      contactEmail: input.contactEmail ?? null,
      contactName: input.contactName ?? null,
      contactPhone: input.contactPhone ?? null,
      notes: input.notes ?? null,
      conversation: input.conversationId
        ? { connect: { id: input.conversationId } }
        : undefined,
    },
  });
}

/**
 * Public context: create a lead from a chat tool call, linking it to a
 * public conversation. Uses runInTenantScope because no session exists.
 */
export async function createLeadFromConversation(params: {
  organizationId: string;
  conversationId: string;
  data: Record<string, unknown>;
  score?: number | null;
  contactEmail?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
}) {
  const { organizationId, conversationId, data, ...rest } = params;

  return runInTenantScope(organizationId, async () => {
    return db.$transaction(async (tx) => {
      const conversation = await tx.publicConversation.findFirst({
        where: { id: conversationId },
        select: { id: true, leadId: true },
      });
      if (!conversation) throw new Error("Conversation not found");

      if (conversation.leadId) {
        return tx.lead.update({
          where: { id: conversation.leadId },
          data: {
            data: data as Prisma.InputJsonValue,
            score: rest.score ?? undefined,
            contactEmail: rest.contactEmail ?? undefined,
            contactName: rest.contactName ?? undefined,
            contactPhone: rest.contactPhone ?? undefined,
            notes: rest.notes ?? undefined,
          },
        });
      }

      const lead = await tx.lead.create({
        data: {
          organizationId,
          data: data as Prisma.InputJsonValue,
          score: rest.score ?? null,
          contactEmail: rest.contactEmail ?? null,
          contactName: rest.contactName ?? null,
          contactPhone: rest.contactPhone ?? null,
          notes: rest.notes ?? null,
        },
      });

      await tx.publicConversation.update({
        where: { id: conversationId },
        data: { leadId: lead.id },
      });

      return lead;
    });
  });
}

export async function updateLead(input: UpdateLeadValues) {
  await requireActiveOrganizationMembership();
  const { leadId, ...data } = input;
  const { count } = await db.lead.updateMany({
    where: { id: leadId },
    data: {
      contactEmail: data.contactEmail,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      notes: data.notes,
      score: data.score,
      assignedUserId: data.assignedUserId,
    },
  });
  if (count === 0) throw new Error("Lead not found");
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await requireActiveOrganizationMembership();
  const { count } = await db.lead.updateMany({
    where: { id: leadId },
    data: { status },
  });
  if (count === 0) throw new Error("Lead not found");
}
