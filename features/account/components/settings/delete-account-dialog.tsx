"use client";

import { useActionState, useEffect, useState } from "react";

import { deleteAccountAction } from "@/features/account/actions/delete-account.actions";
import {
  DELETE_CONFIRMATION_WORD,
  type DeleteAccountInput,
} from "@/features/account/schemas/account.schema";
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useToastMessage } from "@/shared/hooks/use-toast-message";
import { getFieldState } from "@/shared/lib/get-field-state";
import type { FormActionState } from "@/shared/types/form-action-state";

type DeleteAccountDialogProps = {
  children: React.ReactNode;
};

export function DeleteAccountDialog({ children }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    FormActionState<DeleteAccountInput>,
    FormData
  >(deleteAccountAction, {});

  const confirmation = state.values?.confirmation ?? "";
  const confirmationField = getFieldState(state, "confirmation");

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, { kind: "success", trigger: state });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            Type {DELETE_CONFIRMATION_WORD} to confirm. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field data-invalid={confirmationField.invalid}>
            <FieldLabel htmlFor="confirmation">Confirmation</FieldLabel>
            <Input
              id="confirmation"
              name="confirmation"
              placeholder={DELETE_CONFIRMATION_WORD}
              autoComplete="off"
              defaultValue={confirmation}
              aria-invalid={confirmationField.invalid}
            />
            <FieldError>{confirmationField.error}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
