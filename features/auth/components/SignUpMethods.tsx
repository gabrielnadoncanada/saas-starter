"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { signUpWithPasswordAction } from "@/features/auth/actions/sign-up-with-password.action";
import { AuthFlowHiddenFields } from "@/features/auth/components/AuthFlowHiddenFields";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import type { SignUpWithPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { buildCheckEmailHref, getAuthFlowParams, type AuthRedirect } from "@/features/auth/utils/auth-flow";
import { getPostSignInCallbackUrl } from "@/features/auth/utils/post-sign-in";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { getFieldState } from "@/shared/lib/get-field-state";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to continue with this provider. Try a different sign-up method.",
  OAuthSignin: "Unable to continue. Please try again.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

type SignUpMethodsProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function SignUpMethods({
  oauthProviders = [],
  allowMagicLink = false,
  ...authFlow
}: SignUpMethodsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error } = getAuthFlowParams(searchParams);
  const [state, formAction, isPending] = useActionState<SignUpWithPasswordActionState, FormData>(
    signUpWithPasswordAction,
    {},
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showDetailsStep, setShowDetailsStep] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  const emailField = getFieldState(state, "email");
  const passwordField = getFieldState(state, "password");
  const confirmPasswordField = getFieldState(state, "confirmPassword");
  const currentEmail = state.values?.email ?? email;
  const normalizedEmail = normalizeEmail(currentEmail);
  const callbackUrl = getPostSignInCallbackUrl(authFlow);
  const oauthErrorMessage = error ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to continue. Please try again." : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });
  useFormActionToasts(state);

  function validateEmail() {
    if (!normalizedEmail) {
      setEmailError("Enter your email first.");
      return null;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return null;
    }

    setEmail(normalizedEmail);
    setEmailError("");
    return normalizedEmail;
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await signIn(provider, { redirectTo: callbackUrl });
    } finally {
      setPendingProvider(null);
    }
  }

  async function handleMagicLink() {
    const validEmail = validateEmail();
    if (!validEmail) return;

    try {
      setIsSendingMagicLink(true);

      const result = await signIn("resend", {
        email: validEmail,
        redirect: false,
        redirectTo: callbackUrl,
      });

      if (result?.error) {
        throw new Error("Unable to send the sign-up link. Please try again.");
      }

      router.push(
        buildCheckEmailHref(routes.auth.checkEmail, { email: validEmail, ...authFlow }),
      );
    } catch {
      toast.error("Unable to send the sign-up link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  return (
    <div className="space-y-6">
      {!showDetailsStep ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validateEmail()) return;
            setShowDetailsStep(true);
          }}
        >
          <Field data-invalid={Boolean(emailError) || emailField.invalid}>
            <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
            <Input
              id="sign-up-email"
              name="email"
              type="email"
              autoComplete="email"
              value={currentEmail}
              aria-invalid={Boolean(emailError) || emailField.invalid}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError("");
              }}
              required
            />
            <FieldError>{emailError || emailField.error}</FieldError>
          </Field>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{normalizedEmail}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-sm"
                onClick={() => setShowDetailsStep(false)}
              >
                Change
              </Button>
            </div>
            {emailField.error ? <p className="mt-2 text-sm text-destructive">{emailField.error}</p> : null}
          </div>

          <form action={formAction} className="space-y-4">
            <AuthFlowHiddenFields {...authFlow} />
            <input type="hidden" name="email" value={normalizedEmail} />

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

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
            </Button>
          </form>
        </div>
      )}

      {(oauthProviders.length > 0 || allowMagicLink) ? (
        <div className="space-y-3">
          <div className="relative mt-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {allowMagicLink ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handleMagicLink()}
              disabled={isSendingMagicLink}
            >
              {isSendingMagicLink ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending link...</> : <><Mail className="mr-2 h-4 w-4" />Continue with Email Link</>}
            </Button>
          ) : null}

          <OAuthButtons
            providers={oauthProviders}
            pendingProvider={pendingProvider}
            onProviderClick={(provider) => void handleOAuthSignIn(provider)}
          />
        </div>
      ) : null}
    </div>
  );
}
