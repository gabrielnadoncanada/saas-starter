import { z } from "zod";
import { authPasswordSchema } from "@/features/auth/schemas/auth-password.schema";

export const savePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: authPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SavePasswordInput = z.infer<typeof savePasswordSchema>;
