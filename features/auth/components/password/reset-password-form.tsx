"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resetPassword } from "@/features/auth/client/auth-requests";
import {
  resetPasswordDefaultValues,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas/password-change.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { routes } from "@/shared/constants/routes";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefaultValues,
  });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    try {
      const result = await resetPassword(token, newPassword);

      if (result.status !== "success") {
        setError("root", {
          type: "server",
          message: result.message,
        });
        return;
      }

      reset(resetPasswordDefaultValues);
      setSuccess("Your password has been updated. You can now sign in.");
    } catch {
      setError("root", {
        type: "server",
        message: "Unable to reset password. Please try again.",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldGroup className="space-y-4">
        <Field data-invalid={Boolean(errors.newPassword)}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            aria-invalid={Boolean(errors.newPassword)}
            required
            {...register("newPassword")}
          />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="reset-confirm-password">
            Confirm new password
          </FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            required
            {...register("confirmPassword")}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>
      </FieldGroup>

      {errors.root?.message ? (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      ) : null}

      {success ? (
        <p className="text-sm text-emerald-600">
          {success}
          <Link
            href={routes.auth.login}
            className="underline underline-offset-4"
          >
            Go to sign in
          </Link>
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || Boolean(success)}
      >
        {isSubmitting ? (
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
