"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthSecondaryActions } from "@/features/auth/components/shared/AuthSecondaryActions";
import { SignUpEmailStep } from "@/features/auth/components/sign-up/SignUpEmailStep";
import { SignUpPasswordStep } from "@/features/auth/components/sign-up/SignUpPasswordStep";
import {
  emailStepSchema,
  type EmailStepValues,
} from "@/features/auth/schemas/email-step.schema";
import {
  buildAuthHref,
  buildCheckEmailHref,
  getAuthFlowParams,
  type AuthRedirect,
} from "@/features/auth/utils/auth-flow";
import { normalizeEmail } from "@/features/auth/utils/normalize-email";
import { getPostSignInCallbackUrl } from "@/features/auth/utils/post-sign-in";
import { authClient } from "@/shared/lib/auth/auth-client";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to continue with this provider. Try a different sign-up method.",
  OAuthSignin: "Unable to continue. Please try again.",
};

type SignUpFormProps = {
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

export function SignUpForm({
  oauthProviders = [],
  allowMagicLink = false,
  ...authFlow
}: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error } = getAuthFlowParams(searchParams);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(
    null,
  );
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setError,
    setValue,
    trigger,
  } = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues,
  });

  const callbackUrl = getPostSignInCallbackUrl(authFlow);
  const successHref = buildAuthHref(routes.auth.verifyEmailSent, authFlow);
  const oauthErrorMessage = error
    ? OAUTH_ERROR_MESSAGES[error] ?? "Unable to continue. Please try again."
    : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  const emailField = register("email", { onChange: () => clearErrors() });

  async function validateEmailStep() {
    if (!(await trigger("email"))) {
      return null;
    }

    const email = normalizeEmail(getValues("email"));
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    clearErrors();
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
        throw new Error("Unable to send the sign-up link. Please try again.");
      }

      router.push(buildCheckEmailHref(routes.auth.checkEmail, { email, ...authFlow }));
    } catch {
      toast.error("Unable to send the sign-up link. Please try again.");
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
    clearErrors();
  }

  function handleEmailTaken(message: string) {
    setShowPasswordStep(false);
    setError("email", {
      type: "server",
      message,
    });
  }

  return (
    <>
      {showPasswordStep ? (
        <SignUpPasswordStep
          email={submittedEmail}
          callbackUrl={callbackUrl}
          successHref={successHref}
          onChangeEmail={changeEmail}
          onEmailTaken={handleEmailTaken}
        />
      ) : (
        <SignUpEmailStep
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
    </>
  );
}
