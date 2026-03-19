"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import {
  buildCheckEmailHref,
  getAuthFlowParams,
  buildAuthHref,
  type AuthRedirect,
} from "@/features/auth/utils/auth-flow";
import { getPostSignInCallbackUrl } from "@/features/auth/utils/post-sign-in";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to continue with this provider. Try a different sign-up method.",
  OAuthSignin: "Unable to continue. Please try again.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

type SignUpFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function SignUpForm({
  oauthProviders = [],
  allowMagicLink = false,
  ...authFlow
}: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error } = getAuthFlowParams(searchParams);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [showDetailsStep, setShowDetailsStep] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const normalizedEmail = normalizeEmail(email);
  const callbackUrl = getPostSignInCallbackUrl(authFlow);
  const oauthErrorMessage = error ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to continue. Please try again." : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

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

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Za-z]/.test(password)) {
      setPasswordError("Password must include at least one letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must include at least one number.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const { error } = await authClient.signUp.email({
        email: normalizedEmail,
        password,
        name: "",
        callbackURL: callbackUrl,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("already")) {
          setEmailError("This email is already in use.");
        } else {
          setFormError(error.message ?? "Unable to create account.");
        }
        return;
      }

      router.push(buildAuthHref(routes.auth.verifyEmailSent, authFlow));
    } catch {
      setFormError("Unable to create account. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await authClient.signIn.social({ provider, callbackURL: callbackUrl });
    } finally {
      setPendingProvider(null);
    }
  }

  async function handleMagicLink() {
    const validEmail = validateEmail();
    if (!validEmail) return;

    try {
      setIsSendingMagicLink(true);

      const { error } = await authClient.signIn.magicLink({
        email: validEmail,
        callbackURL: callbackUrl,
      });

      if (error) {
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
    <>
      {!showDetailsStep ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validateEmail()) return;
            setShowDetailsStep(true);
          }}
        >
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
            <Input
              id="sign-up-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="Enter your email address..."
              aria-invalid={Boolean(emailError)}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError("");
              }}
              required
            />
            <FieldError>{emailError}</FieldError>
          </Field>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
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
            {emailError ? <p className="mt-2 text-sm text-destructive">{emailError}</p> : null}
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Field data-invalid={Boolean(passwordError)}>
              <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
              <PasswordInput
                id="sign-up-password"
                name="password"
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
              />
              <FieldError>{passwordError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(confirmPasswordError)}>
              <FieldLabel htmlFor="sign-up-confirm-password">Confirm password</FieldLabel>
              <PasswordInput
                id="sign-up-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPasswordError)}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                required
              />
              <FieldError>{confirmPasswordError}</FieldError>
            </Field>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
            </Button>
          </form>
        </div>
      )}

      {(oauthProviders.length > 0 || allowMagicLink) ? (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
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
    </>
  );
}
