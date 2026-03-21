"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ResendVerificationForm } from "@/features/auth/components/oauth/ResendVerificationForm";
import { AuthSecondaryActions } from "@/features/auth/components/shared/AuthSecondaryActions";
import { SignInEmailStep } from "@/features/auth/components/sign-in/SignInEmailStep";
import { SignInPasswordStep } from "@/features/auth/components/sign-in/SignInPasswordStep";
import {
  emailStepSchema,
  type EmailStepValues,
} from "@/features/auth/schemas/email-step.schema";
import {
  buildCheckEmailHref,
  getAuthFlowParams,
  type AuthRedirect,
} from "@/features/auth/utils/auth-flow";
import { normalizeEmail } from "@/features/auth/utils/normalize-email";
import { getPostSignInCallbackUrl } from "@/features/auth/utils/post-sign-in";
import { authClient } from "@/shared/lib/auth/auth-client";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";
import { routes } from "@/shared/constants/routes";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to sign in with this provider. Try a different sign-in method.",
  OAuthSignin: "Unable to sign in. Please try again.",
};

type SignInFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

const defaultValues: EmailStepValues = {
  email: "",
};

export function SignInForm({
  oauthProviders = [],
  allowMagicLink = false,
  ...authFlow
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error } = getAuthFlowParams(searchParams);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(
    null,
  );
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setValue,
    trigger,
  } = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues,
  });

  const callbackUrl = getPostSignInCallbackUrl(authFlow);
  const oauthErrorMessage = error
    ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to sign in. Please try again."
    : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
      setShowVerification(false);
    },
  });

  async function validateEmailStep() {
    if (!(await trigger("email"))) {
      return null;
    }

    const email = normalizeEmail(getValues("email"));
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    clearErrors();
    setShowVerification(false);
    return email;
  }

  async function continueToPasswordStep() {
    const email = await validateEmailStep();
    if (!email) return;

    setSubmittedEmail(email);
    setShowPasswordStep(true);
  }

  async function handleMagicLink() {
    const email = await validateEmailStep();
    if (!email) return;

    try {
      setIsSendingMagicLink(true);
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      });

      if (error) {
        throw new Error("Unable to send the sign-in link. Please try again.");
      }

      router.push(buildCheckEmailHref(routes.auth.checkEmail, { email, ...authFlow }));
    } catch {
      toast.error("Unable to send the sign-in link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
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

  function changeEmail() {
    setShowPasswordStep(false);
    setShowVerification(false);
  }

  return (
    <>
      {showPasswordStep ? (
        <SignInPasswordStep
          email={submittedEmail}
          callbackUrl={callbackUrl}
          onChangeEmail={changeEmail}
          onVerificationChange={setShowVerification}
        />
      ) : (
        <SignInEmailStep
          emailField={emailField}
          emailError={errors.email?.message}
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

      {showVerification && submittedEmail ? (
        <ResendVerificationForm email={submittedEmail} {...authFlow} />
      ) : null}
    </>
  );
}
