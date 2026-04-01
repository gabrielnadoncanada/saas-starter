"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { updateAccountAction } from "@/features/account/actions/update-account.action";
import type { UpdateAccountActionState } from "@/features/account/types/account.types";
import { PhoneInput } from "@/shared/components/forms/phone-input";
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
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { getFieldState } from "@/shared/lib/get-field-state";

type EditProfileDialogProps = {
  name: string;
  phoneNumber: string;
  children: React.ReactNode;
};

export function EditProfileDialog({
  name,
  phoneNumber,
  children,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    UpdateAccountActionState,
    FormData
  >(updateAccountAction, {});

  const currentName = state.values?.name ?? name;
  const currentPhoneNumber = state.values?.phoneNumber ?? phoneNumber;

  const nameField = getFieldState(state, "name");
  const phoneNumberField = getFieldState(state, "phoneNumber");
  const [phoneNumberValue, setPhoneNumberValue] = useState(currentPhoneNumber);

  useEffect(() => {
    setPhoneNumberValue(currentPhoneNumber);
  }, [currentPhoneNumber]);

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
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name and phone number.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" action={formAction}>
          <Field data-invalid={nameField.invalid}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              defaultValue={currentName}
              aria-invalid={nameField.invalid}
              required
            />
            <FieldError>{nameField.error}</FieldError>
          </Field>

          <Field data-invalid={phoneNumberField.invalid}>
            <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
            <PhoneInput
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={phoneNumberValue}
              onChange={(value) => setPhoneNumberValue(value ?? "")}
              aria-invalid={phoneNumberField.invalid}
            />
            <FieldError>{phoneNumberField.error}</FieldError>
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
