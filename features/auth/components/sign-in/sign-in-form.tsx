"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  buildCheckEmailHref,
  sendMagicLink,
  signInWithOAuth,
} from "@/features/auth/client/auth-requests";
import { ResendVerificationForm } from "@/features/auth/components/oauth/resend-verification-form";
import { AuthEmailStep } from "@/features/auth/components/shared/auth-email-step";
import { AuthSecondaryActions } from "@/features/auth/components/shared/auth-secondary-actions";
import { SignInPasswordStep } from "@/features/auth/components/sign-in/sign-in-password-step";
import {
  emailDefaultValues,
  emailSchema,
  type EmailValues,
} from "@/features/auth/schemas/auth-forms.schema";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to sign in with this provider. Try a different sign-in method.",
  OAuthSignin: "Unable to sign in. Please try again.",
};

type SignInFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  callbackUrl?: string | null;
};

export function SignInForm({
  oauthProviders = [],
  allowMagicLink = false,
  callbackUrl = "/post-sign-in",
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setValue,
    trigger,
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues,
  });

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
      setShowVerification(false);
    },
  });
  const oauthErrorMessage = error
    ? (OAUTH_ERROR_MESSAGES[error] ?? "Unable to sign in. Please try again.")
    : null;
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  async function validateEmail() {
    if (!(await trigger("email"))) {
      return null;
    }

    const email = getValues("email").trim().toLowerCase();
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    clearErrors();
    setShowVerification(false);
    return email;
  }

  async function handleContinue() {
    const email = await validateEmail();

    if (!email) {
      return;
    }

    setSubmittedEmail(email);
    setShowPasswordStep(true);
  }

  async function handleMagicLink() {
    const email = await validateEmail();

    if (!email) {
      return;
    }

    try {
      setIsSendingMagicLink(true);
      await sendMagicLink(email, nextCallbackUrl);
      router.push(buildCheckEmailHref(email, nextCallbackUrl));
    } catch {
      toast.error("Unable to send the sign-in link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await signInWithOAuth(provider, nextCallbackUrl);
    } catch {
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <>
      {showPasswordStep ? (
        <SignInPasswordStep
          email={submittedEmail}
          callbackUrl={nextCallbackUrl}
          onChangeEmail={() => setShowPasswordStep(false)}
          onVerificationChange={setShowVerification}
        />
      ) : (
        <AuthEmailStep
          formId="sign-in-email"
          label="Email"
          submitLabel="Sign in"
          emailField={emailField}
          emailError={errors.email?.message}
          onSubmit={(event) => {
            event.preventDefault();
            void handleContinue();
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

      {showVerification && submittedEmail ? (
        <ResendVerificationForm email={submittedEmail} />
      ) : null}
    </>
  );
}
