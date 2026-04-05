"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  createOrganizationAction,
  type CreateOrganizationActionState,
} from "@/features/organizations/actions/create-organization.actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { getFieldState } from "@/shared/lib/get-field-state";

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    CreateOrganizationActionState,
    FormData
  >(createOrganizationAction, {});

  const nameField = getFieldState(state, "name");

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
      onOpenChange(false);
    }

    if (state.refreshKey) {
      router.refresh();
    }
  }, [onOpenChange, router, state.error, state.fieldErrors, state.refreshKey, state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace for your team. You can invite members after
            creation.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field data-invalid={nameField.invalid}>
            <FieldLabel htmlFor="create-org-name">Name</FieldLabel>
            <Input
              id="create-org-name"
              name="name"
              placeholder="Acme Inc."
              defaultValue={nameField.value}
              aria-invalid={nameField.invalid}
              autoFocus
              required
            />
            <FieldError>{nameField.error}</FieldError>
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
