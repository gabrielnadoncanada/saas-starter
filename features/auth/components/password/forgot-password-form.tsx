"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
    return (
      <div className="flex items-start gap-3 border border-brand/30 bg-brand/5 px-4 py-3">
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-brand"
          strokeWidth={1.75}
        />
        <p className="text-sm">{state.success}</p>
      </div>
    );
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
        <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
