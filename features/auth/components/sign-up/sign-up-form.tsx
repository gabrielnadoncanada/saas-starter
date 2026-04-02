"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/shared/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  buildCheckEmailHref,
  sendMagicLink,
  signInWithOAuth,
  signUpWithEmail,
} from "@/features/auth/client/auth-requests";
import { AuthEmailStep } from "@/features/auth/components/shared/auth-email-step";
import { AuthPasswordStep } from "@/features/auth/components/shared/auth-password-step";
import { AuthSecondaryActions } from "@/features/auth/components/shared/auth-secondary-actions";
import {
  emailDefaultValues,
  emailSchema,
  type EmailValues,
  signUpPasswordDefaultValues,
  signUpPasswordSchema,
  type SignUpPasswordValues,
} from "@/features/auth/schemas/auth-forms.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

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
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues,
  });
  const passwordForm = useForm<SignUpPasswordValues>({
    resolver: zodResolver(signUpPasswordSchema),
    defaultValues: signUpPasswordDefaultValues,
  });
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setError,
    setValue,
    trigger,
  } = emailForm;

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
    },
  });
  const passwordField = passwordForm.register("password", {
    onChange: () => passwordForm.clearErrors(),
  });
  const confirmPasswordField = passwordForm.register("confirmPassword", {
    onChange: () => passwordForm.clearErrors(),
  });
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";
  const successHref = buildCallbackURL(
    routes.auth.verifyEmailSent,
    nextCallbackUrl,
  );
  const oauthErrorMessage = error
    ? error === "OAuthAccountNotLinked"
      ? t("signup.unableToSignUpProvider")
      : t("signup.unableToSignUp")
    : null;
  const passwordErrors = passwordForm.formState.errors;
  const isSubmitting = passwordForm.formState.isSubmitting;

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
      toast.error(t("toast.signUpLinkFailed"));
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);
      await signInWithOAuth(provider, nextCallbackUrl);
    } catch {
      toast.error(t("signup.unableToSignUp"));
    } finally {
      setPendingProvider(null);
    }
  }

  const handlePasswordSubmit = passwordForm.handleSubmit(
    async ({ password }) => {
      passwordForm.clearErrors();

      try {
        const result = await signUpWithEmail(
          submittedEmail,
          password,
          nextCallbackUrl,
        );

        if (result.status !== "success") {
          if (result.status === "email_taken") {
            setShowPasswordStep(false);
            setError("email", { type: "server", message: result.message });
            return;
          }

          passwordForm.setError("root", {
            type: "server",
            message: result.message,
          });
          return;
        }

        router.push(successHref);
      } catch {
        passwordForm.setError("root", {
          type: "server",
          message: t("signup.unableToCreateAccount"),
        });
      }
    },
  );

  return (
    <>
      {showPasswordStep ? (
        <AuthPasswordStep
          email={submittedEmail}
          errorMessage={passwordErrors.root?.message}
          isSubmitting={isSubmitting}
          pendingLabel={t("signup.creatingAccount")}
          submitLabel={t("signUp")}
          onChangeEmail={() => setShowPasswordStep(false)}
          onSubmit={handlePasswordSubmit}
        >
          <Field data-invalid={Boolean(passwordErrors.password)}>
            <FieldLabel htmlFor="sign-up-password">{t("password")}</FieldLabel>
            <PasswordInput
              id="sign-up-password"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordErrors.password)}
              required
              {...passwordField}
            />
            <FieldError>{passwordErrors.password?.message}</FieldError>
          </Field>

          <Field data-invalid={Boolean(passwordErrors.confirmPassword)}>
            <FieldLabel htmlFor="sign-up-confirm-password">
              {t("confirmPassword")}
            </FieldLabel>
            <PasswordInput
              id="sign-up-confirm-password"
              autoComplete="new-password"
              aria-invalid={Boolean(passwordErrors.confirmPassword)}
              required
              {...confirmPasswordField}
            />
            <FieldError>{passwordErrors.confirmPassword?.message}</FieldError>
          </Field>
        </AuthPasswordStep>
      ) : (
        <AuthEmailStep
          formId="sign-up-email"
          label={t("email")}
          submitLabel={tc("continue")}
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

