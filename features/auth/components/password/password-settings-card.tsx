"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { savePassword } from "@/features/auth/data/auth-requests";
import {
  createPasswordFormSchema,
  passwordFormDefaultValues,
  type PasswordFormValues,
} from "@/features/auth/schemas/password-change.schema";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";

type PasswordSettingsCardProps = {
  hasPassword: boolean;
};

export function PasswordSettingsCard({
  hasPassword,
}: PasswordSettingsCardProps) {
  const schema = useMemo(
    () => createPasswordFormSchema({ requireCurrentPassword: hasPassword }),
    [hasPassword],
  );
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: passwordFormDefaultValues,
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      const result = await savePassword(
        hasPassword,
        newPassword,
        currentPassword,
      );

      if (result.status !== "success") {
        if (result.status === "incorrect_current_password") {
          setError("currentPassword", {
            type: "server",
            message: result.message,
          });
          return;
        }

        toast.error(result.message);
        return;
      }

      reset(passwordFormDefaultValues);
      toast.success(
        hasPassword
          ? "Password updated successfully."
          : "Password created successfully.",
      );
    } catch {
      toast.error("Unable to update password. Please try again.");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {hasPassword ? "Change password" : "Create a password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FieldGroup className="space-y-4">
            {hasPassword ? (
              <Field data-invalid={Boolean(errors.currentPassword)}>
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <PasswordInput
                  id="current-password"
                  aria-invalid={Boolean(errors.currentPassword)}
                  required
                  {...register("currentPassword")}
                />
                <FieldError>{errors.currentPassword?.message}</FieldError>
              </Field>
            ) : null}

            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput
                id="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                required
                {...register("newPassword")}
              />
              <FieldError>{errors.newPassword?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirm-password">
                Confirm new password
              </FieldLabel>
              <PasswordInput
                id="confirm-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                required
                {...register("confirmPassword")}
              />
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasPassword ? (
              "Update password"
            ) : (
              "Create password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
