"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signUpWithPasswordAction } from "@/features/auth/actions/sign-up-with-password.action";
import type { SignUpWithPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { AuthFlowHiddenFields } from "@/features/auth/components/AuthFlowHiddenFields";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

type PasswordSignUpFormProps = {
  redirect?: string | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function PasswordSignUpForm(props: PasswordSignUpFormProps) {
  const [state, formAction, isPending] = useActionState<
    SignUpWithPasswordActionState,
    FormData
  >(signUpWithPasswordAction, {});

  const nameField = getFieldState(state, "name");
  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const confirmPasswordField = getFieldState(state, "confirmPassword");

  useFormActionToasts(state);

  return (
    <form action={formAction} className="space-y-4">
      <AuthFlowHiddenFields {...props} />

      <FieldGroup className="space-y-4">
        <Field data-invalid={nameField.invalid}>
          <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
          <Input
            id="sign-up-name"
            name="name"
            defaultValue={state.values?.name ?? ""}
            aria-invalid={nameField.invalid}
            required
          />
          <FieldError>{nameField.error}</FieldError>
        </Field>

        <Field data-invalid={emailField.invalid}>
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input
            id="sign-up-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email ?? ""}
            aria-invalid={emailField.invalid}
            required
          />
          <FieldError>{emailField.error}</FieldError>
        </Field>

        <Field data-invalid={passwordField.invalid}>
          <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
          <PasswordInput
            id="sign-up-password"
            name="password"
            autoComplete="new-password"
            aria-invalid={passwordField.invalid}
            required
          />
          <FieldError>{passwordField.error}</FieldError>
        </Field>

        <Field data-invalid={confirmPasswordField.invalid}>
          <FieldLabel htmlFor="sign-up-confirm-password">Confirm password</FieldLabel>
          <PasswordInput
            id="sign-up-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            aria-invalid={confirmPasswordField.invalid}
            required
          />
          <FieldError>{confirmPasswordField.error}</FieldError>
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account with password"
        )}
      </Button>
    </form>
  );
}
