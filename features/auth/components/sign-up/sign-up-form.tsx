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
import { AuthEmailStep } from "@/features/auth/components/shared/auth-email-step";
import { AuthSecondaryActions } from "@/features/auth/components/shared/auth-secondary-actions";
import { SignUpPasswordStep } from "@/features/auth/components/sign-up/sign-up-password-step";
import {
  emailDefaultValues,
  emailSchema,
  type EmailValues,
} from "@/features/auth/schemas/auth-forms.schema";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

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
    setError,
    setValue,
    trigger,
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues,
  });

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
    },
  });
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";
  const successHref = buildCallbackURL(
    routes.auth.verifyEmailSent,
    nextCallbackUrl,
  );
  const oauthErrorMessage = error
    ? (OAUTH_ERROR_MESSAGES[error] ?? "Unable to continue. Please try again.")
    : null;

  useToastMessage(oauthErrorMessage, { kind: "error", trigger: error });

  async function validateEmail() {
    if (!(await trigger("email"))) {
      return null;
    }

    const email = getValues("email").trim().toLowerCase();
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    clearErrors();
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

  return (
    <>
      {showPasswordStep ? (
        <SignUpPasswordStep
          email={submittedEmail}
          callbackUrl={nextCallbackUrl}
          successHref={successHref}
          onChangeEmail={() => setShowPasswordStep(false)}
          onEmailTaken={(message) => {
            setShowPasswordStep(false);
            setError("email", { type: "server", message });
          }}
        />
      ) : (
        <AuthEmailStep
          formId="sign-up-email"
          label="Email"
          submitLabel="Continue"
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
    </>
  );
}
