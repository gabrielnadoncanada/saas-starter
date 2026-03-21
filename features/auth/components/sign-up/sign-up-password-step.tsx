"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthEmailSummary } from "@/features/auth/components/shared/auth-email-summary";
import { signUpWithEmail } from "@/features/auth/data/auth-requests";
import {
  signUpPasswordDefaultValues,
  signUpPasswordSchema,
  type SignUpPasswordValues,
} from "@/features/auth/schemas/sign-up.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";

type SignUpPasswordStepProps = {
  email: string;
  callbackUrl: string;
  successHref: string;
  onChangeEmail: () => void;
  onEmailTaken: (message: string) => void;
};

export function SignUpPasswordStep({
  email,
  callbackUrl,
  successHref,
  onChangeEmail,
  onEmailTaken,
}: SignUpPasswordStepProps) {
  const router = useRouter();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignUpPasswordValues>({
    resolver: zodResolver(signUpPasswordSchema),
    defaultValues: signUpPasswordDefaultValues,
  });

  const passwordField = register("password", { onChange: () => clearErrors() });
  const confirmPasswordField = register("confirmPassword", {
    onChange: () => clearErrors(),
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    clearErrors();

    try {
      const result = await signUpWithEmail(email, password, callbackUrl);

      if (result.status !== "success") {
        if (result.status === "email_taken") {
          onEmailTaken(result.message);
          return;
        }

        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }

      router.push(successHref);
    } catch {
      setError("root", {
        type: "server",
        message: "Unable to create account. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-3">
      <AuthEmailSummary email={email} onChange={onChangeEmail} />

      <form onSubmit={onSubmit} className="space-y-4">
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
          <PasswordInput
            id="sign-up-password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            required
            {...passwordField}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="sign-up-confirm-password">Confirm password</FieldLabel>
          <PasswordInput
            id="sign-up-confirm-password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            required
            {...confirmPasswordField}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>

        {errors.root?.message ? (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </div>
  );
}
