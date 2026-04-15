"use client";

import Link from "next/link";
import { useActionState } from "react";

import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { routes } from "@/constants/routes";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/features/auth/actions/public-auth.actions";
import { getFieldState } from "@/lib/get-field-state";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordActionState,
    FormData
  >(resetPasswordAction, {});
  const newPasswordField = getFieldState(state, "newPassword");
  const confirmPasswordField = getFieldState(state, "confirmPassword");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <FieldGroup className="space-y-4">
        <Field data-invalid={newPasswordField.invalid}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            name="newPassword"
            aria-invalid={newPasswordField.invalid}
            required
          />
          <FieldError>{newPasswordField.error}</FieldError>
        </Field>

        <Field data-invalid={confirmPasswordField.invalid}>
          <FieldLabel htmlFor="reset-confirm-password">
            Confirm new password
          </FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            name="confirmPassword"
            aria-invalid={confirmPasswordField.invalid}
            required
          />
          <FieldError>{confirmPasswordField.error}</FieldError>
        </Field>
      </FieldGroup>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      {state.success ? (
        <FormAlert tone="success">
          {state.success}{" "}
          <Link
            href={routes.auth.login}
            className="font-medium underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Go to sign in
          </Link>
          .
        </FormAlert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || Boolean(state.success)}
      >
        {isPending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
