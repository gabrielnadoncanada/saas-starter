import { z } from "zod";

export const authPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email first.")
    .email("Enter a valid email address."),
});

export const signInPasswordSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

export const signInFormSchema = z.object({
  email: emailSchema.shape.email,
  password: signInPasswordSchema.shape.password,
  callbackUrl: z.string().optional(),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

export function confirmPasswordField(emptyMessage: string) {
  return z.string().min(1, emptyMessage);
}

const signUpPasswordFields = {
  password: authPasswordSchema,
  confirmPassword: confirmPasswordField("Confirm your password."),
};

function validatePasswordConfirmation(
  values: { password: string; confirmPassword: string },
  ctx: z.RefinementCtx,
) {
  if (values.password !== values.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
}

export const signUpFormSchema = z
  .object({
    email: emailSchema.shape.email,
    ...signUpPasswordFields,
    callbackUrl: z.string().optional(),
  })
  .superRefine(validatePasswordConfirmation);

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const resendVerificationEmailSchema = z.object({
  email: emailSchema.shape.email,
  callbackUrl: z.string().optional(),
});

export type ResendVerificationEmailValues = z.infer<
  typeof resendVerificationEmailSchema
>;
