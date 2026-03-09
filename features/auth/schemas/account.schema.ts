import { z } from "zod";

export const DELETE_CONFIRMATION_WORD = "DELETE";

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine(
      (value) => value === DELETE_CONFIRMATION_WORD,
      "Type DELETE to confirm.",
    ),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

export const unlinkAuthProviderSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type UnlinkAuthProviderInput = z.infer<typeof unlinkAuthProviderSchema>;
