import { z } from "zod";

import { authPasswordSchema } from "@/features/auth/schemas/auth-forms.schema";

const confirmPasswordSchema = z.string().min(1, "Confirm your new password.");
const passwordChangeBaseSchema = z.object({
  currentPassword: z.string(),
  newPassword: authPasswordSchema,
  confirmPassword: confirmPasswordSchema,
});

export type PasswordFormValues = z.infer<typeof passwordChangeBaseSchema>;
export type ResetPasswordValues = Pick<
  PasswordFormValues,
  "newPassword" | "confirmPassword"
>;
export type SavePasswordInput = PasswordFormValues;

export const passwordFormDefaultValues: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const resetPasswordDefaultValues: ResetPasswordValues = {
  newPassword: "",
  confirmPassword: "",
};

function applyPasswordConfirmation(
  values: ResetPasswordValues,
  ctx: z.RefinementCtx,
) {
  if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
}

export function createPasswordFormSchema({
  requireCurrentPassword,
}: {
  requireCurrentPassword: boolean;
}) {
  return passwordChangeBaseSchema.superRefine((values, ctx) => {
    if (requireCurrentPassword && !values.currentPassword.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Current password is required.",
      });
    }

    applyPasswordConfirmation(values, ctx);
  });
}

export const resetPasswordSchema = passwordChangeBaseSchema
  .omit({ currentPassword: true })
  .superRefine(applyPasswordConfirmation);

export const savePasswordSchema = passwordChangeBaseSchema.superRefine(
  applyPasswordConfirmation,
);
