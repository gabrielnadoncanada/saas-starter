import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/server/passwords";

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(72, "Password is too long.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const authFlowSchema = z.object({
  redirect: z.enum(["checkout"]).optional(),
  priceId: z.string().trim().optional(),
  pricingModel: z.string().trim().optional(),
  inviteId: z.string().trim().optional(),
});

const emailSchema = z.string().trim().email("Enter a valid email address.");

export const signUpWithPasswordSchema = authFlowSchema
  .extend({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInWithPasswordSchema = authFlowSchema.extend({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const resendVerificationEmailSchema = authFlowSchema.extend({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Invalid reset link."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpWithPasswordInput = z.infer<typeof signUpWithPasswordSchema>;
export type SignInWithPasswordInput = z.infer<typeof signInWithPasswordSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
