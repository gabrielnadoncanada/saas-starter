"use client";

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
import { deleteOrganizationAction } from "@/features/organizations/actions/delete-organization.actions";
import {
  DELETE_ORGANIZATION_CONFIRMATION_WORD,
  type DeleteOrganizationInput,
} from "@/features/organizations/organization.schema";
import { useToastMessage } from "@/hooks/use-toast-message";
import { getFieldState } from "@/lib/get-field-state";
import type { FormActionState } from "@/types/form-action-state";

type DeleteOrganizationDialogProps = {
  children: React.ReactNode;
};

export function DeleteOrganizationDialog({
  children,
}: DeleteOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    FormActionState<DeleteOrganizationInput>,
    FormData
  >(deleteOrganizationAction, {});

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
          <DialogTitle>Delete organization</DialogTitle>
          <DialogDescription>
            This will permanently delete this organization and all of its data,
            including tasks, members, and billing history. Type{" "}
            {DELETE_ORGANIZATION_CONFIRMATION_WORD} to confirm. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field data-invalid={confirmationField.invalid}>
            <FieldLabel htmlFor="confirmation">Confirmation</FieldLabel>
            <Input
              id="confirmation"
              name="confirmation"
              placeholder={DELETE_ORGANIZATION_CONFIRMATION_WORD}
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
              {isPending ? "Deleting..." : "Delete organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
