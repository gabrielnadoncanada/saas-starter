"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  buildCheckEmailHref,
  sendMagicLink,
  signInWithOAuth,
  signUpWithEmail,
} from "@/features/auth/client/auth-requests";
import { AuthEmailStep } from "@/features/auth/components/auth-email-step";
import { AuthPasswordStep } from "@/features/auth/components/auth-password-step";
import { AuthSecondaryActions } from "@/features/auth/components/auth-secondary-actions";
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
import { useToastMessage } from "@/shared/hooks/use-toast-message";
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
      ? "Unable to continue with this provider. Try a different sign-up method."
      : "Unable to continue. Please try again."
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
          message: "Unable to create account. Please try again.",
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
          pendingLabel={"Creating account..."}
          submitLabel={"Create account"}
          onChangeEmail={() => setShowPasswordStep(false)}
          onSubmit={handlePasswordSubmit}
        >
          <Field data-invalid={Boolean(passwordErrors.password)}>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
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
              Confirm new password
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
          label={"Email"}
          submitLabel={"Continue"}
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
