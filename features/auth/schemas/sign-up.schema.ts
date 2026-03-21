import { z } from "zod";
import { authPasswordSchema } from "@/features/auth/schemas/auth-password.schema";

const confirmPasswordSchema = z.string().min(1, "Confirm your password.");

export const signUpPasswordSchema = z
  .object({
    password: authPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type SignUpPasswordValues = z.infer<typeof signUpPasswordSchema>;

export const signUpPasswordDefaultValues: SignUpPasswordValues = {
  password: "",
  confirmPassword: "",
};
