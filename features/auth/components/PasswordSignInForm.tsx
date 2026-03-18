"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signInWithPasswordAction } from "@/features/auth/actions/sign-in-with-password.action";
import type { SignInWithPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { AuthFlowHiddenFields } from "@/features/auth/components/AuthFlowHiddenFields";
import { ResendVerificationForm } from "@/features/auth/components/ResendVerificationForm";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { routes } from "@/shared/constants/routes";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

type PasswordSignInFormProps = {
  redirect?: string | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function PasswordSignInForm(props: PasswordSignInFormProps) {
  const [state, formAction, isPending] = useActionState<
    SignInWithPasswordActionState,
    FormData
  >(signInWithPasswordAction, {});

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const email = state.values?.email ?? "";

  useFormActionToasts(state, {
    skipError: true,
  });

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <AuthFlowHiddenFields {...props} />

        <FieldGroup className="space-y-4">
          <Field data-invalid={emailField.invalid}>
            <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
            <Input
              id="sign-in-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={email}
              aria-invalid={emailField.invalid}
              required
            />
            <FieldError>{emailField.error}</FieldError>
          </Field>

          <Field data-invalid={passwordField.invalid}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
              <Link
                href={routes.auth.forgotPassword}
                className="text-sm text-muted-foreground underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="sign-in-password"
              name="password"
              autoComplete="current-password"
              aria-invalid={passwordField.invalid}
              required
            />
            <FieldError>{passwordField.error}</FieldError>
          </Field>
        </FieldGroup>

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in with password"
          )}
        </Button>
      </form>

      {state.code === "EMAIL_NOT_VERIFIED" && email ? (
        <ResendVerificationForm email={email} {...props} />
      ) : null}
    </div>
  );
}
