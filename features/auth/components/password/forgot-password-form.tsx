"use client";

import { useActionState } from "react";

import {
  requestPasswordResetAction,
  type RequestPasswordResetActionState,
} from "@/features/auth/actions/public-auth.actions";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { routes } from "@/shared/constants/routes";
import { getFieldState } from "@/shared/lib/get-field-state";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    RequestPasswordResetActionState,
    FormData
  >(requestPasswordResetAction, {});
  const emailField = getFieldState(state, "email");

  if (state.success) {
    return <p className="text-sm text-muted-foreground">{state.success}</p>;
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

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
