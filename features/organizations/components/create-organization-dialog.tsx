"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { accountFlags } from "@/config/account.config";
import { authClient } from "@/lib/auth/auth-client";

type CreateOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [nameError, setNameError] = useState<string>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    if (!accountFlags.allowCreateOrganization) {
      toast.error("Creating organizations is not enabled.");
      return;
    }

    setIsPending(true);
    setNameError(undefined);

    try {
      const { data: organization, error } =
        await authClient.organization.create({
          name,
          slug: crypto.randomUUID(),
        });

      if (error) {
        throw new Error(error.message ?? "Failed to create organization");
      }

      await authClient.organization.setActive({
        organizationId: organization.id,
      });

      toast.success("Organization created");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create organization",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Create a new organization for your team. You can invite members
            after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field data-invalid={!!nameError}>
            <FieldLabel htmlFor="create-org-name">Name</FieldLabel>
            <Input
              id="create-org-name"
              name="name"
              placeholder="Acme Inc."
              aria-invalid={!!nameError}
              autoFocus
              required
            />
            <FieldError>{nameError}</FieldError>
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
