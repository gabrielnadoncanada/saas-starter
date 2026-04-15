"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import {
  requestPasswordResetAction,
  type RequestPasswordResetActionState,
} from "@/features/auth/actions/public-auth.actions";
import { getFieldState } from "@/lib/get-field-state";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    RequestPasswordResetActionState,
    FormData
  >(requestPasswordResetAction, {});
  const emailField = getFieldState(state, "email");

  if (state.success) {
    return <FormAlert tone="success">{state.success}</FormAlert>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="callbackUrl"
        value={routes.auth.resetPassword}
      />

      <Field data-invalid={emailField.invalid}>
        <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
        <Input
          id="forgot-password-email"
          name="email"
          type="email"
          defaultValue={emailField.value}
          aria-invalid={emailField.invalid}
          required
        />
        <FieldError>{emailField.error}</FieldError>
      </Field>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
