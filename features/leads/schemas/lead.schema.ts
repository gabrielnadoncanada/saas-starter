import { z } from "zod";

import { LeadStatus } from "@/lib/db/enums";

export const createLeadSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  score: z.number().int().min(0).max(100).optional(),
  contactEmail: z.string().email().max(255).optional(),
  contactName: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(5000).optional(),
  conversationId: z.string().min(1).optional(),
});

export const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.nativeEnum(LeadStatus),
});

export const updateLeadSchema = z.object({
  leadId: z.string().min(1),
  contactEmail: z.string().email().max(255).optional(),
  contactName: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(5000).optional(),
  score: z.number().int().min(0).max(100).optional(),
  assignedUserId: z.string().min(1).nullable().optional(),
});

export type CreateLeadValues = z.infer<typeof createLeadSchema>;
export type UpdateLeadValues = z.infer<typeof updateLeadSchema>;
