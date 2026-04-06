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

export function confirmPasswordField(emptyMessage: string) {
  return z.string().min(1, emptyMessage);
}

export const signUpPasswordSchema = z
  .object({
    password: authPasswordSchema,
    confirmPassword: confirmPasswordField("Confirm your password."),
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
