"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { savePasswordAction } from "@/features/auth/actions/save-password.action";
import type { SavePasswordInput } from "@/features/auth/schemas/save-password.schema";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { PasswordInput } from "@/shared/components/forms/password-input";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import type { FormActionState } from "@/shared/types/form-action-state";

type EditPasswordDialogProps = {
  hasPassword: boolean;
  children: React.ReactNode;
};

export function EditPasswordDialog({
  hasPassword,
  children,
}: EditPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    FormActionState<SavePasswordInput>,
    FormData
  >(savePasswordAction, {});

  const currentPasswordField = getFieldState(state, "currentPassword");
  const newPasswordField = getFieldState(state, "newPassword");
  const confirmPasswordField = getFieldState(state, "confirmPassword");

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  useToastMessage(state.error, { kind: "error", skip: Boolean(state.fieldErrors), trigger: state });
  useToastMessage(state.success, { kind: "success", trigger: state });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasPassword ? "Change password" : "Create a password"}
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "Enter your current password and choose a new one."
              : "Create a password for your account."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" action={formAction}>
          <input type="hidden" name="hasPassword" value={String(hasPassword)} />

          {hasPassword && (
            <Field data-invalid={currentPasswordField.invalid}>
              <FieldLabel htmlFor="currentPassword">
                Current password
              </FieldLabel>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                aria-invalid={currentPasswordField.invalid}
                required
              />
              <FieldError>{currentPasswordField.error}</FieldError>
            </Field>
          )}

          <Field data-invalid={newPasswordField.invalid}>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              aria-invalid={newPasswordField.invalid}
              required
            />
            <FieldError>{newPasswordField.error}</FieldError>
          </Field>

          <Field data-invalid={confirmPasswordField.invalid}>
            <FieldLabel htmlFor="confirmPassword">
              Confirm new password
            </FieldLabel>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              aria-invalid={confirmPasswordField.invalid}
              required
            />
            <FieldError>{confirmPasswordField.error}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
