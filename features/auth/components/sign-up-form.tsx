"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useRef, useState } from "react";

import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import {
  signUpAction,
  type SignUpActionState,
} from "@/features/auth/actions/public-auth.actions";
import { emailSchema } from "@/features/auth/auth-forms.schema";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useAuthSocialActions } from "@/features/auth/hooks/use-auth-social-actions";
import { useToastMessage } from "@/hooks/use-toast-message";
import type { OAuthProviderId } from "@/lib/auth/oauth-config";
import { getFieldState } from "@/lib/get-field-state";

type SignUpFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  callbackUrl?: string | null;
};

function getOAuthErrorMessage(error: string | null): string | null {
  if (!error) {
    return null;
  }

  if (error === "OAuthAccountNotLinked") {
    return "Unable to continue with this provider. Try a different sign-up method.";
  }

  return "Unable to continue. Please try again.";
}

export function SignUpForm({
  oauthProviders = [],
  allowMagicLink = false,
  callbackUrl = routes.auth.postSignIn,
}: SignUpFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [emailClientError, setEmailClientError] = useState<string>();
  const [state, formAction, isPending] = useActionState<
    SignUpActionState,
    FormData
  >(signUpAction, {});
  const nextCallbackUrl = callbackUrl ?? routes.auth.postSignIn;

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const confirmPasswordField = getFieldState(state, "confirmPassword");
  const oauthErrorMessage = getOAuthErrorMessage(error);
  const formError = state.error && !state.fieldErrors ? state.error : null;

  const { magicLink, oauth } = useAuthSocialActions({
    callbackUrl: nextCallbackUrl,
    magicLinkErrorMessage: "Unable to send the sign-up link. Please try again.",
    oauthErrorMessage: "Unable to continue. Please try again.",
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
        isSendingMagicLink={magicLink.isPending}
        providers={oauthProviders}
        pendingProvider={oauth.pendingProvider}
        onMagicLink={handleMagicLink}
        onProviderClick={oauth.submit}
      />
    </div>
  );
}
