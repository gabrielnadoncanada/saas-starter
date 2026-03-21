"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { AuthEmailSummary } from "@/features/auth/components/shared/auth-email-summary";
import { signInWithPassword } from "@/features/auth/data/auth-requests";
import {
  passwordStepSchema,
  type PasswordStepValues,
} from "@/features/auth/schemas/password-step.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";

type SignInPasswordStepProps = {
  email: string;
  callbackUrl: string;
  onChangeEmail: () => void;
  onVerificationChange: (visible: boolean) => void;
};

const defaultValues: PasswordStepValues = {
  password: "",
};

export function SignInPasswordStep({
  email,
  callbackUrl,
  onChangeEmail,
  onVerificationChange,
}: SignInPasswordStepProps) {
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<PasswordStepValues>({
    resolver: zodResolver(passwordStepSchema),
    defaultValues,
  });

  const passwordField = register("password", {
    onChange: () => {
      clearErrors();
      onVerificationChange(false);
    },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    clearErrors();
    onVerificationChange(false);

    try {
      const result = await signInWithPassword(email, password);

      if (result.status !== "success") {
        setError("root", {
          type: "server",
          message: result.message,
        });
        onVerificationChange(result.status === "verification_required");
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("root", {
        type: "server",
        message: "Unable to sign in. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
      <AuthEmailSummary email={email} onChange={onChangeEmail} />

      <form onSubmit={onSubmit} className="space-y-4">
        <Field data-invalid={Boolean(errors.password)}>
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
            aria-invalid={Boolean(errors.password)}
            required
            {...passwordField}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        {errors.root?.message ? (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
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
  );
}
