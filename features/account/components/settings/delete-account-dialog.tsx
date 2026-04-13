"use client";

import { KeyRound } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteAccountAction } from "@/features/account/actions/delete-account.actions";
import {
  DELETE_CONFIRMATION_WORD,
  type DeleteAccountInput,
} from "@/features/account/schemas/account.schema";
import { useToastMessage } from "@/hooks/use-toast-message";
import { getFieldState } from "@/lib/get-field-state";
import type { FormActionState } from "@/types/form-action-state";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    FormActionState<DeleteAccountInput>,
    FormData
  >(deleteAccountAction, {});

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
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <KeyRound className="mr-2 h-3.5 w-3.5" />
          Delete Account
        </Button>
      </DialogTrigger>
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
              defaultValue={confirmationField.value}
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
