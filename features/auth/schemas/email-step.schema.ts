import { z } from "zod";

export const emailStepSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email first.")
    .email("Enter a valid email address."),
});

export type EmailStepValues = z.infer<typeof emailStepSchema>;