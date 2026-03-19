"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";

type PasswordSettingsCardProps = {
  hasPassword: boolean;
};

export function PasswordSettingsCard({ hasPassword }: PasswordSettingsCardProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (hasPassword && !currentPassword) {
      setCurrentPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Za-z]/.test(newPassword)) {
      setNewPasswordError("Password must include at least one letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setNewPasswordError("Password must include at least one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const { error } = hasPassword
        ? await authClient.changePassword({ currentPassword, newPassword })
        : await authClient.$fetch<{ status: boolean }>("/set-password", {
            method: "POST",
            body: { newPassword },
          });

      if (error) {
        if (error.message?.toLowerCase().includes("current") || error.message?.toLowerCase().includes("incorrect")) {
          setCurrentPasswordError("Current password is incorrect.");
        } else {
          toast.error(error.message ?? "Unable to update password.");
        }
        return;
      }

      toast.success(hasPassword ? "Password updated successfully." : "Password created successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Unable to update password. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Change password" : "Create a password"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="space-y-4">
            {hasPassword ? (
              <Field data-invalid={Boolean(currentPasswordError)}>
                <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                <PasswordInput
                  id="current-password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    if (currentPasswordError) setCurrentPasswordError("");
                  }}
                  aria-invalid={Boolean(currentPasswordError)}
                  required
                />
                <FieldError>{currentPasswordError}</FieldError>
              </Field>
            ) : null}

            <Field data-invalid={Boolean(newPasswordError)}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <PasswordInput
                id="new-password"
                name="newPassword"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (newPasswordError) setNewPasswordError("");
                }}
                aria-invalid={Boolean(newPasswordError)}
                required
              />
              <FieldError>{newPasswordError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(confirmPasswordError)}>
              <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                aria-invalid={Boolean(confirmPasswordError)}
                required
              />
              <FieldError>{confirmPasswordError}</FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
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
