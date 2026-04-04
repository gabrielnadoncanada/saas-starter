"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  inviteOrganizationMemberAction,
  type InviteOrganizationMemberActionState,
} from "@/features/organizations/actions/organization-owner.actions";
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
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { useRouter } from "@/shared/i18n/navigation";
import { getFieldState } from "@/shared/lib/get-field-state";

type InviteOrganizationMemberDialogProps = {
  canInviteMembers: boolean;
};

export function InviteOrganizationMemberDialog({
  canInviteMembers,
}: InviteOrganizationMemberDialogProps) {
  const t = useTranslations("organizations");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    InviteOrganizationMemberActionState,
    FormData
  >(inviteOrganizationMemberAction, {});

  const emailField = getFieldState(state, "email");
  const defaultEmail = state.values?.email ?? "";
  const defaultRole = state.values?.role ?? "member";

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    }

    if (state.refreshKey) {
      router.refresh();
    }
  }, [router, state.error, state.fieldErrors, state.refreshKey, state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canInviteMembers}>
          <UserPlus className="size-4" />
          {t("invite.button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("invite.title")}</DialogTitle>
          <DialogDescription>{t("invite.description")}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <Field data-invalid={emailField.invalid}>
            <FieldLabel htmlFor="invite-member-email">{t("invite.emailLabel")}</FieldLabel>
            <Input
              id="invite-member-email"
              name="email"
              type="email"
              placeholder={t("invite.emailPlaceholder")}
              defaultValue={defaultEmail}
              aria-invalid={emailField.invalid}
              disabled={!canInviteMembers}
              required
            />
            <FieldError>{emailField.error}</FieldError>
          </Field>

          <div className="space-y-3">
            <Label>{t("invite.roleLabel")}</Label>
            <RadioGroup
              name="role"
              defaultValue={defaultRole}
              disabled={!canInviteMembers}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="member" id="invite-role-member" />
                <Label htmlFor="invite-role-member">{t("invite.roleMember")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="admin" id="invite-role-admin" />
                <Label htmlFor="invite-role-admin">{t("invite.roleAdmin")}</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{tc("cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || !canInviteMembers}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("invite.sending")}
                </>
              ) : (
                t("invite.sendInvite")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

