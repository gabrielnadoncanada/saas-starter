"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import {
  signUpAction,
  type SignUpActionState,
} from "@/features/auth/actions/public-auth.actions";
import { emailSchema } from "@/features/auth/auth-forms.schema";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useToastMessage } from "@/hooks/use-toast-message";
import { authClient } from "@/lib/auth/auth-client";
import { buildCheckEmailHref } from "@/lib/auth/callback-url";
import type { OAuthProviderId } from "@/lib/auth/oauth-config";
import { getFieldState } from "@/lib/get-field-state";

type SignUpFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  callbackUrl?: string | null;
};

export function SignUpForm({
  oauthProviders = [],
  allowMagicLink = false,
  callbackUrl = "/post-sign-in",
}: SignUpFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [emailClientError, setEmailClientError] = useState<string>();
  const [state, formAction, isPending] = useActionState<
    SignUpActionState,
    FormData
  >(signUpAction, {});
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const confirmPasswordField = getFieldState(state, "confirmPassword");
  const oauthErrorMessage = error
    ? error === "OAuthAccountNotLinked"
      ? "Unable to continue with this provider. Try a different sign-up method."
      : "Unable to continue. Please try again."
    : null;
  const formError = state.error && !state.fieldErrors ? state.error : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });
  useAuthRedirect(state.redirectTo);

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
          authError.message || "Unable to send the sign-up link.",
        );
      }

      window.location.assign(buildCheckEmailHref(email, nextCallbackUrl));
    } catch {
      toast.error("Unable to send the sign-up link. Please try again.");
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
        throw new Error(authError.message || "Unable to continue.");
      }
    } catch {
      toast.error("Unable to continue. Please try again.");
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={nextCallbackUrl} />

        <Field data-invalid={Boolean(emailClientError) || emailField.invalid}>
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input
            id="sign-up-email"
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
          <FieldLabel htmlFor="sign-up-confirm-password">
            Confirm password
          </FieldLabel>
          <PasswordInput
            id="sign-up-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            aria-invalid={confirmPasswordField.invalid}
            required
          />
          <FieldError>{confirmPasswordField.error}</FieldError>
        </Field>

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
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
    </div>
  );
}
