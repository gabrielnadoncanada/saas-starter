"use client";

import { CFileUpload } from "@/shared/components/ui/c-file-upload";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  type FormEvent,
  useActionState,
  useEffect,
  useState,
} from "react";

import { updateAccountAction } from "@/features/account/actions/update-account.actions";
import type { UpdateAccountInput } from "@/features/account/schemas/account.schema";
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
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useToastMessage } from "@/shared/hooks/use-toast-message";
import type { FileWithPreview } from "@/shared/hooks/use-file-upload";
import { getFieldState } from "@/shared/lib/get-field-state";
import type { FormActionState } from "@/shared/types/form-action-state";

type EditProfileDialogProps = {
  image: string | null;
  name: string;
};

export function EditProfileDialog({ image, name }: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<FileWithPreview | null>(null);
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
    setAvatar(null);
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
      setAvatar(null);
      setRemoveExistingAvatar(false);
    }
  }

  function handleAvatarChange(next: FileWithPreview | null) {
    setAvatar(next);
    if (next?.file instanceof File) {
      setRemoveExistingAvatar(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (avatar?.file instanceof File) {
      formData.set("avatar", avatar.file);
      formData.delete("removeAvatar");
    } else {
      formData.delete("avatar");
      if (removeExistingAvatar) {
        formData.set("removeAvatar", "true");
      } else {
        formData.delete("removeAvatar");
      }
    }

    startTransition(() => formAction(formData));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Profile image</FieldLabel>
            <CFileUpload
              defaultAvatar={image ?? undefined}
              onFileChange={handleAvatarChange}
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
