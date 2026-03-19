"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/shared/lib/auth/auth-client";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setConfirmError("");
    setFormError("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setFormError(error.message ?? "This reset link is invalid or has expired.");
        return;
      }

      setSuccess("Your password has been updated. You can now sign in.");
    } catch {
      setFormError("Unable to reset password. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup className="space-y-4">
        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            name="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError("");
            }}
            aria-invalid={Boolean(passwordError)}
            required
          />
          <FieldError>{passwordError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(confirmError)}>
          <FieldLabel htmlFor="reset-confirm-password">Confirm new password</FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (confirmError) setConfirmError("");
            }}
            aria-invalid={Boolean(confirmError)}
            required
          />
          <FieldError>{confirmError}</FieldError>
        </Field>
      </FieldGroup>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      {success ? (
        <p className="text-sm text-emerald-600">
          {success}{" "}
          <Link href={routes.auth.login} className="underline underline-offset-4">
            Go to sign in
          </Link>
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending || Boolean(success)}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
