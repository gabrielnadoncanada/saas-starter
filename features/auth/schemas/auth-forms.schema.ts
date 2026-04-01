import { z } from "zod";

import { authPasswordSchema } from "@/features/auth/schemas/auth-password.schema";

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email first.")
    .email("Enter a valid email address."),
});

export type EmailValues = z.infer<typeof emailSchema>;

export const emailDefaultValues: EmailValues = {
  email: "",
};

export const signInPasswordSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

export type SignInPasswordValues = z.infer<typeof signInPasswordSchema>;

export const signInPasswordDefaultValues: SignInPasswordValues = {
  password: "",
};

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
