"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions/reset-password.action";
import type { ResetPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState<ResetPasswordActionState, FormData>(
    resetPasswordAction,
    {},
  );
  const passwordField = getFieldState(state, "password");
  const confirmPasswordField = getFieldState(state, "confirmPassword");

  useFormActionToasts(state);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <FieldGroup className="space-y-4">
        <Field data-invalid={passwordField.invalid}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput id="reset-password" name="password" aria-invalid={passwordField.invalid} required />
          <FieldError>{passwordField.error}</FieldError>
        </Field>

        <Field data-invalid={confirmPasswordField.invalid}>
          <FieldLabel htmlFor="reset-confirm-password">Confirm new password</FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            name="confirmPassword"
            aria-invalid={confirmPasswordField.invalid}
            required
          />
          <FieldError>{confirmPasswordField.error}</FieldError>
        </Field>
      </FieldGroup>

      {state.success ? (
        <p className="text-sm text-emerald-600">
          {state.success}{" "}
          <Link href={routes.auth.login} className="underline underline-offset-4">
            Go to sign in
          </Link>
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
