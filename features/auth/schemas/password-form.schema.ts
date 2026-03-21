import { z } from "zod";
import { authPasswordSchema } from "@/features/auth/schemas/auth-password.schema";

const confirmNewPasswordSchema = z.string().min(1, "Confirm your new password.");
const passwordFormBaseSchema = z.object({
  currentPassword: z.string(),
  newPassword: authPasswordSchema,
  confirmPassword: confirmNewPasswordSchema,
});

export type PasswordFormValues = z.infer<typeof passwordFormBaseSchema>;
export type ResetPasswordValues = Pick<PasswordFormValues, "newPassword" | "confirmPassword">;

export const passwordFormDefaultValues: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const resetPasswordDefaultValues: ResetPasswordValues = {
  newPassword: "",
  confirmPassword: "",
};

export function createPasswordFormSchema({
  requireCurrentPassword,
}: {
  requireCurrentPassword: boolean;
}) {
  return passwordFormBaseSchema.superRefine((values, ctx) => {
    if (requireCurrentPassword && !values.currentPassword.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Current password is required.",
      });
    }

    if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });
}

export const resetPasswordSchema = passwordFormBaseSchema
  .omit({ currentPassword: true })
  .superRefine((values, ctx) => {
    if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });
