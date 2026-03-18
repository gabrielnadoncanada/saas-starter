import { z } from "zod";

import { oauthProviderIdSchema } from "@/shared/lib/auth/providers";

export const DELETE_CONFIRMATION_WORD = "DELETE";

export const deleteAccountSchema = z.object({
  confirmation: z.literal(DELETE_CONFIRMATION_WORD, {
    errorMap: () => ({ message: "Type DELETE to confirm." }),
  }),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  phoneNumber: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .transform((value) => (value.length ? value : null)),
});

export const unlinkAuthProviderSchema = z.object({
  provider: oauthProviderIdSchema,
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UnlinkAuthProviderInput = z.infer<typeof unlinkAuthProviderSchema>;
