"use client";

import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CFileUpload } from "@/components/ui/c-file-upload";
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
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateAccountAction } from "@/features/account/actions/update-account.actions";
import type { UpdateAccountInput } from "@/features/account/schemas/account.schema";
import { useToastMessage } from "@/hooks/use-toast-message";
import { getFieldState } from "@/lib/get-field-state";
import type { FormActionState } from "@/types/form-action-state";

type EditProfileDialogProps = {
  image: string | null;
  name: string;
};

export function EditProfileDialog({ image, name }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [removeExistingAvatar, setRemoveExistingAvatar] = useState(false);
  const [state, formAction, isPending] = useActionState<
    FormActionState<UpdateAccountInput>,
    FormData
  >(updateAccountAction, {});

  const nameField = getFieldState(state, "name", name);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setOpen(false);
    setRemoveExistingAvatar(false);
    router.refresh();
  }, [router, state]);

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, { kind: "success", trigger: state });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setRemoveExistingAvatar(false);
    }
  }

  function handleAvatarChange(hasAvatar: boolean) {
    if (hasAvatar) {
      setRemoveExistingAvatar(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto shrink-0">
          <Pencil className="h-3.5 w-3.5 sm:mr-2" />
          <span className="hidden sm:inline">Edit Profile</span>
          <span className="sr-only sm:hidden">Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" action={formAction}>
          <input
            type="hidden"
            name="removeAvatar"
            value={removeExistingAvatar ? "true" : "false"}
          />

          <Field>
            <FieldLabel>Profile image</FieldLabel>
            <CFileUpload
              inputName="avatar"
              defaultAvatar={image ?? undefined}
              onFileChange={(file) => handleAvatarChange(Boolean(file))}
              onExistingAvatarClear={() => setRemoveExistingAvatar(true)}
              className="items-center flex-row"
            />
          </Field>

          <Field data-invalid={nameField.invalid}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder={"Enter your name"}
              defaultValue={nameField.value}
              aria-invalid={nameField.invalid}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
