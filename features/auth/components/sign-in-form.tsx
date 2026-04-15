"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import {
  signInAction,
  type SignInActionState,
} from "@/features/auth/actions/public-auth.actions";
import { emailSchema } from "@/features/auth/auth-forms.schema";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
import { ResendVerificationForm } from "@/features/auth/components/oauth/resend-verification-form";
import { useToastMessage } from "@/hooks/use-toast-message";
import { authClient } from "@/lib/auth/auth-client";
import { buildCheckEmailHref } from "@/lib/auth/callback-url";
import type { OAuthProviderId } from "@/lib/auth/oauth-config";
import { getFieldState } from "@/lib/get-field-state";

type SignInFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  callbackUrl?: string | null;
};

export function SignInForm({
  oauthProviders = [],
  allowMagicLink = false,
  callbackUrl = routes.auth.postSignIn,
}: SignInFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const lastRedirectRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [emailClientError, setEmailClientError] = useState<string>();
  const [state, formAction, isPending] = useActionState<
    SignInActionState,
    FormData
  >(signInAction, {});
  const nextCallbackUrl = callbackUrl ?? routes.auth.postSignIn;

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const oauthErrorMessage = error
    ? error === "OAuthAccountNotLinked"
      ? "Unable to sign in with this provider. Try a different sign-in method."
      : "Unable to sign in. Please try again."
    : null;
  const emailValue = emailField.value;
  const formError = state.error && !state.fieldErrors ? state.error : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  useEffect(() => {
    if (!state.redirectTo || lastRedirectRef.current === state.redirectTo) {
      return;
    }

    lastRedirectRef.current = state.redirectTo;
    window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  async function handleMagicLink() {
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

    const email = parsed.data.email.trim().toLowerCase();

    setEmailClientError(undefined);
    setIsSendingMagicLink(true);

    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: nextCallbackUrl,
      });

      if (authError) {
        throw new Error(
          authError.message || "Unable to send the sign-in link.",
        );
      }

      window.location.assign(buildCheckEmailHref(email, nextCallbackUrl));
    } catch {
      toast.error("Unable to send the sign-in link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);

      const { error: authError } = await authClient.signIn.social({
        provider,
        callbackURL: nextCallbackUrl,
      });

      if (authError) {
        throw new Error(authError.message || "Unable to sign in.");
      }
    } catch {
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setPendingProvider(null);
    }
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
            defaultValue={emailValue}
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

        {formError ? (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <AuthSecondaryActions
        allowMagicLink={allowMagicLink}
        isSendingMagicLink={isSendingMagicLink}
        providers={oauthProviders}
        pendingProvider={pendingProvider}
        onMagicLink={() => void handleMagicLink()}
        onProviderClick={(provider) => void handleOAuthSignIn(provider)}
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
