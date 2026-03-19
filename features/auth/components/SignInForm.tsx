"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { ResendVerificationForm } from "@/features/auth/components/ResendVerificationForm";
import {
  buildCheckEmailHref,
  getAuthFlowParams,
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
    "Unable to sign in with this provider. Try a different sign-in method.",
  OAuthSignin: "Unable to sign in. Please try again.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

type SignInFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function SignInForm({
  oauthProviders = [],
  allowMagicLink = false,
  ...authFlow
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error } = getAuthFlowParams(searchParams);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const normalizedEmail = normalizeEmail(email);
  const callbackUrl = getPostSignInCallbackUrl(authFlow);
  const oauthErrorMessage = error ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to sign in. Please try again." : null;

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

  async function handlePasswordSignIn(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    setIsPending(true);

    try {
      const { error } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("email") && error.message?.toLowerCase().includes("verif")) {
          setShowVerification(true);
          setFormError("Verify your email before signing in.");
        } else {
          setFormError(error.message ?? "Invalid email or password.");
        }
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setFormError("Unable to sign in. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
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
        throw new Error("Unable to send the sign-in link. Please try again.");
      }

      router.push(
        buildCheckEmailHref(routes.auth.checkEmail, {
          email: validEmail,
          ...authFlow,
        }),
      );
    } catch {
      toast.error("Unable to send the sign-in link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  return (
    <>
      {!showPasswordStep ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validateEmail()) return;
            setShowPasswordStep(true);
          }}
        >
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
            <Input
              id="sign-in-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="Enter your email address..."
              aria-invalid={Boolean(emailError)}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) {
                  setEmailError("");
                }
              }}
              required
            />
            <FieldError>{emailError}</FieldError>
          </Field>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{normalizedEmail}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-sm"
              onClick={() => setShowPasswordStep(false)}
            >
              Change
            </Button>
          </div>

          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <Field>
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
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
              <span className="bg-cardpx-2 text-muted-foreground">
                Or continue with
              </span>
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
              {isSendingMagicLink ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email Link
                </>
              )}
            </Button>
          ) : null}

          {oauthProviders.length > 0 ? (
            <OAuthButtons
              providers={oauthProviders}
              pendingProvider={pendingProvider}
              onProviderClick={(provider) => void handleOAuthSignIn(provider)}
            />
          ) : null}
        </div>
      ) : null}

      {showVerification && normalizedEmail ? (
        <ResendVerificationForm email={normalizedEmail} {...authFlow} />
      ) : null}
    </>
  );
}
