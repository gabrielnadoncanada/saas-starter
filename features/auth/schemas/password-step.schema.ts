import { z } from "zod";

export const passwordStepSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

export type PasswordStepValues = z.infer<typeof passwordStepSchema>;