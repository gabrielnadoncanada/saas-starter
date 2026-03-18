"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/features/auth/actions/update-password.action";
import type { UpdatePasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

type PasswordSettingsCardProps = {
  hasPassword: boolean;
};

export function PasswordSettingsCard({ hasPassword }: PasswordSettingsCardProps) {
  const [state, formAction, isPending] = useActionState<UpdatePasswordActionState, FormData>(
    updatePasswordAction,
    {},
  );
  const currentPasswordField = getFieldState(state, "currentPassword");
  const newPasswordField = getFieldState(state, "newPassword");
  const confirmPasswordField = getFieldState(state, "confirmPassword");

  useFormActionToasts(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Change password" : "Create a password"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup className="space-y-4">
            {hasPassword ? (
              <Field data-invalid={currentPasswordField.invalid}>
                <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                <PasswordInput
                  id="current-password"
                  name="currentPassword"
                  aria-invalid={currentPasswordField.invalid}
                  required
                />
                <FieldError>{currentPasswordField.error}</FieldError>
              </Field>
            ) : null}

            <Field data-invalid={newPasswordField.invalid}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput id="new-password" name="newPassword" aria-invalid={newPasswordField.invalid} required />
              <FieldError>{newPasswordField.error}</FieldError>
            </Field>

            <Field data-invalid={confirmPasswordField.invalid}>
              <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                aria-invalid={confirmPasswordField.invalid}
                required
              />
              <FieldError>{confirmPasswordField.error}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasPassword ? (
              "Update password"
            ) : (
              "Create password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
