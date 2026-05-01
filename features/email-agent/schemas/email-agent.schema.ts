import { z } from "zod";

export const updateAccountSettingsSchema = z.object({
  emailAccountId: z.string().min(1),
  autoSendEnabled: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.string()])
    .transform((v) => v === "on" || v === "true")
    .optional(),
  agentInstructions: z.string().max(4000).optional().or(z.literal("")),
  signature: z.string().max(2000).optional().or(z.literal("")),
});

export type UpdateAccountSettingsValues = z.infer<
  typeof updateAccountSettingsSchema
>;

export const draftIdSchema = z.object({
  draftId: z.string().min(1),
});

export type DraftIdValues = z.infer<typeof draftIdSchema>;

export const updateDraftSchema = z.object({
  draftId: z.string().min(1),
  bodyText: z.string().min(1).max(20_000),
});

export type UpdateDraftValues = z.infer<typeof updateDraftSchema>;

export const disconnectAccountSchema = z.object({
  emailAccountId: z.string().min(1),
});

export type DisconnectAccountValues = z.infer<typeof disconnectAccountSchema>;
