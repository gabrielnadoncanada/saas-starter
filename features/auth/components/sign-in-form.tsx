"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useRef, useState } from "react";

import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import {
  signInAction,
  type SignInActionState,
} from "@/features/auth/actions/public-auth.actions";
import { emailSchema } from "@/features/auth/auth-forms.schema";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
import { ResendVerificationForm } from "@/features/auth/components/oauth/resend-verification-form";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useAuthSocialActions } from "@/features/auth/hooks/use-auth-social-actions";
import { useToastMessage } from "@/hooks/use-toast-message";
import type { OAuthProviderId } from "@/lib/auth/oauth-config";
import { getFieldState } from "@/lib/get-field-state";

type SignInFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  callbackUrl?: string | null;
};

function getOAuthErrorMessage(error: string | null): string | null {
  if (!error) {
    return null;
  }

  if (error === "OAuthAccountNotLinked") {
    return "Unable to sign in with this provider. Try a different sign-in method.";
  }

  return "Unable to sign in. Please try again.";
}

export function SignInForm({
  oauthProviders = [],
  allowMagicLink = false,
  callbackUrl = routes.auth.postSignIn,
}: SignInFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [emailClientError, setEmailClientError] = useState<string>();
  const [state, formAction, isPending] = useActionState<
    SignInActionState,
    FormData
  >(signInAction, {});
  const nextCallbackUrl = callbackUrl ?? routes.auth.postSignIn;

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const oauthErrorMessage = getOAuthErrorMessage(error);
  const formError = state.error && !state.fieldErrors ? state.error : null;

  const { magicLink, oauth } = useAuthSocialActions({
    callbackUrl: nextCallbackUrl,
    magicLinkErrorMessage: "Unable to send the sign-in link. Please try again.",
    oauthErrorMessage: "Unable to sign in. Please try again.",
  });

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });
  useAuthRedirect(state.redirectTo);

  function handleMagicLink(): void {
    if (!formRef.current) {
      return;
    }

    const parsed = emailSchema.safeParse(
      Object.fromEntries(new FormData(formRef.current)),
    );

    if (!parsed.success) {
      setEmailClientError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    setEmailClientError(undefined);
    magicLink.submit(parsed.data.email.trim().toLowerCase());
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={nextCallbackUrl} />

        <Field data-invalid={Boolean(emailClientError) || emailField.invalid}>
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={"Enter your email address..."}
            defaultValue={emailField.value}
            aria-invalid={Boolean(emailClientError) || emailField.invalid}
            onChange={() => setEmailClientError(undefined)}
            required
          />
          <FieldError>{emailClientError ?? emailField.error}</FieldError>
        </Field>

        <Field data-invalid={passwordField.invalid}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
            <Link
              href={routes.auth.forgotPassword}
              className="text-xs text-muted-foreground underline underline-offset-4 decoration-brand/40 hover:text-foreground hover:decoration-brand"
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

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <AuthSecondaryActions
        allowMagicLink={allowMagicLink}
        isSendingMagicLink={magicLink.isPending}
        providers={oauthProviders}
        pendingProvider={oauth.pendingProvider}
        onMagicLink={handleMagicLink}
        onProviderClick={oauth.submit}
      />

      {state.requiresVerification && state.values?.email ? (
        <ResendVerificationForm
          email={String(state.values.email)}
          callbackUrl={nextCallbackUrl}
        />
      ) : null}
    </div>
  );
}
