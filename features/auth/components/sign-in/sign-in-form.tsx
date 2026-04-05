"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  buildCheckEmailHref,
  sendMagicLink,
  signInWithOAuth,
  signInWithPassword,
} from "@/features/auth/client/auth-requests";
import { AuthEmailStep } from "@/features/auth/components/auth-email-step";
import { AuthPasswordStep } from "@/features/auth/components/auth-password-step";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
import { ResendVerificationForm } from "@/features/auth/components/oauth/resend-verification-form";
import {
  emailDefaultValues,
  emailSchema,
  type EmailValues,
  signInPasswordDefaultValues,
  signInPasswordSchema,
  type SignInPasswordValues,
} from "@/features/auth/schemas/auth-forms.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { Link } from "@/shared/i18n/navigation";
import { useRouter } from "@/shared/i18n/navigation";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

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
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues,
  });
  const passwordForm = useForm<SignInPasswordValues>({
    resolver: zodResolver(signInPasswordSchema),
    defaultValues: signInPasswordDefaultValues,
  });
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setValue,
    trigger,
  } = emailForm;

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
      setShowVerification(false);
    },
  });
  const passwordField = passwordForm.register("password", {
    onChange: () => {
      passwordForm.clearErrors();
      setShowVerification(false);
    },
  });
  const oauthErrorMessage = error
    ? error === "OAuthAccountNotLinked"
      ? "Unable to sign in with this provider. Try a different sign-in method."
      : "Unable to sign in. Please try again."
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

  const handlePasswordSubmit = passwordForm.handleSubmit(
    async ({ password }) => {
      passwordForm.clearErrors();
      setShowVerification(false);

      try {
        const result = await signInWithPassword(submittedEmail, password);

        if (result.status !== "success") {
          passwordForm.setError("root", {
            type: "server",
            message: result.message,
          });
          setShowVerification(result.status === "verification_required");
          return;
        }

        window.location.href = nextCallbackUrl;
      } catch {
        passwordForm.setError("root", {
          type: "server",
          message: "Unable to sign in. Please try again.",
        });
      }
    },
  );

  return (
    <>
      {showPasswordStep ? (
        <AuthPasswordStep
          email={submittedEmail}
          errorMessage={passwordForm.formState.errors.root?.message}
          isSubmitting={passwordForm.formState.isSubmitting}
          pendingLabel={"Signing in..."}
          submitLabel={"Sign in"}
          onChangeEmail={() => setShowPasswordStep(false)}
          onSubmit={handlePasswordSubmit}
        >
          <Field data-invalid={Boolean(passwordForm.formState.errors.password)}>
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
              autoComplete="current-password"
              aria-invalid={Boolean(passwordForm.formState.errors.password)}
              required
              {...passwordField}
            />
            <FieldError>
              {passwordForm.formState.errors.password?.message}
            </FieldError>
          </Field>
        </AuthPasswordStep>
      ) : (
        <AuthEmailStep
          formId="sign-in-email"
          label={"Email"}
          submitLabel={"Sign in"}
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

