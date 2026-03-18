"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { requestPasswordResetAction } from "@/features/auth/actions/request-password-reset.action";
import type { ForgotPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ForgotPasswordActionState, FormData>(
    requestPasswordResetAction,
    {},
  );
  const emailField = getFieldState(state, "email");

  useFormActionToasts(state);

  return (
    <form action={formAction} className="space-y-4">
      <Field data-invalid={emailField.invalid}>
        <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
        <Input
          id="forgot-password-email"
          name="email"
          type="email"
          defaultValue={state.values?.email ?? ""}
          aria-invalid={emailField.invalid}
          required
        />
        <FieldError>{emailField.error}</FieldError>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
