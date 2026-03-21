"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  buildCheckEmailHref,
  sendMagicLink,
  signInWithOAuth,
} from "@/features/auth/data/auth-requests";
import { AuthEmailStep } from "@/features/auth/components/shared/auth-email-step";
import { AuthSecondaryActions } from "@/features/auth/components/shared/auth-secondary-actions";
import { SignUpPasswordStep } from "@/features/auth/components/sign-up/sign-up-password-step";
import { useAuthEmailStep } from "@/features/auth/hooks/use-auth-email-step";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";
import { routes } from "@/shared/constants/routes";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to continue with this provider. Try a different sign-up method.",
  OAuthSignin: "Unable to continue. Please try again.",
};

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(
    null,
  );
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const {
    continueToPasswordStep,
    emailError,
    emailField,
    returnToEmailStep,
    setEmailError,
    showPasswordStep,
    submittedEmail,
    validateEmail,
  } = useAuthEmailStep();
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";

  const successHref = buildCallbackURL(routes.auth.verifyEmailSent, nextCallbackUrl);
  const oauthErrorMessage = error
    ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to continue. Please try again."
    : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  async function handleMagicLink() {
    const email = await validateEmail();
    if (!email) return;

    try {
      setIsSendingMagicLink(true);
      await sendMagicLink(email, nextCallbackUrl);
      router.push(buildCheckEmailHref(email, nextCallbackUrl));
    } catch {
      toast.error("Unable to send the sign-up link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await signInWithOAuth(provider, nextCallbackUrl);
    } catch {
      toast.error("Unable to continue. Please try again.");
    } finally {
      setPendingProvider(null);
    }
  }

  function handleEmailTaken(message: string) {
    setEmailError(message);
  }

  return (
    <>
      {showPasswordStep ? (
        <SignUpPasswordStep
          email={submittedEmail}
          callbackUrl={nextCallbackUrl}
          successHref={successHref}
          onChangeEmail={returnToEmailStep}
          onEmailTaken={handleEmailTaken}
        />
      ) : (
        <AuthEmailStep
          formId="sign-up-email"
          label="Email"
          submitLabel="Continue"
          emailField={emailField}
          emailError={emailError}
          onSubmit={(event) => {
            event.preventDefault();
            void continueToPasswordStep();
          }}
        />
      )}

      <AuthSecondaryActions
        allowMagicLink={allowMagicLink}
        isSendingMagicLink={isSendingMagicLink}
        providers={oauthProviders}
        pendingProvider={pendingProvider}
        onMagicLink={() => void handleMagicLink()}
        onProviderClick={(provider) => void handleOAuthSignIn(provider)}
      />
    </>
  );
}
