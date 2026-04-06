import { z } from "zod";

import {
  authPasswordSchema,
  confirmPasswordField,
} from "@/features/auth/schemas/auth-forms.schema";

const passwordChangeBaseSchema = z.object({
  currentPassword: z.string().default(""),
  newPassword: authPasswordSchema,
  confirmPassword: confirmPasswordField("Confirm your new password."),
});

export type PasswordFormValues = z.infer<typeof passwordChangeBaseSchema>;
export type ResetPasswordValues = Pick<
  PasswordFormValues,
  "newPassword" | "confirmPassword"
>;

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
