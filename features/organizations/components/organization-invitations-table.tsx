"use client";

import { Mail, MoreVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelOrganizationInvitationAction,
  type CancelOrganizationInvitationActionState,
  resendOrganizationInvitationAction,
  type ResendOrganizationInvitationActionState,
} from "@/features/organizations/actions/membership.actions";
import type { OrganizationInvitationView } from "@/features/organizations/types";
import { formatShortDate } from "@/lib/date/format-date";

type OrganizationInvitationsTableProps = {
  canManageInvitations: boolean;
  invitations: OrganizationInvitationView[];
};

function InvitationActions({
  invitation,
  canManageInvitations,
}: {
  invitation: OrganizationInvitationView;
  canManageInvitations: boolean;
}) {
  const router = useRouter();
  const [resendState, resendAction, isResending] = useActionState<
    ResendOrganizationInvitationActionState,
    FormData
  >(resendOrganizationInvitationAction, {});
  const [cancelState, cancelAction, isCanceling] = useActionState<
    CancelOrganizationInvitationActionState,
    FormData
  >(cancelOrganizationInvitationAction, {});

  useEffect(() => {
    if (resendState.error) {
      toast.error(resendState.error);
    }

    if (cancelState.error) {
      toast.error(cancelState.error);
    }

    if (resendState.success) {
      toast.success(resendState.success);
    }

    if (cancelState.success) {
      toast.success(cancelState.success);
    }

    if (resendState.refreshKey || cancelState.refreshKey) {
      router.refresh();
    }
  }, [
    cancelState.error,
    cancelState.refreshKey,
    cancelState.success,
    resendState.error,
    resendState.refreshKey,
    resendState.success,
    router,
  ]);

  if (!canManageInvitations) {
    return null;
  }

  const submitInvitationAction = (
    dispatch: (formData: FormData) => void,
  ) => {
    const formData = new FormData();
    formData.set("invitationId", invitation.id);
    dispatch(formData);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <MoreVertical className="size-4" />
          <span className="sr-only">Open invitation actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isResending}
          onSelect={() => submitInvitationAction(resendAction)}
        >
          <Mail className="size-4" />
          {isResending ? "Resending..." : "Resend invite"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isCanceling}
          onSelect={() => submitInvitationAction(cancelAction)}
        >
          <X className="size-4" />
          {isCanceling ? "Canceling..." : "Cancel invite"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrganizationInvitationsTable({
  canManageInvitations,
  invitations,
}: OrganizationInvitationsTableProps) {
  return (
    <div className="rounded-md border p-0.5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            {canManageInvitations ? (
              <TableHead className="w-16 text-right" />
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.length ? (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatShortDate(invitation.expiresAt) ?? "Pending"}
                </TableCell>
                {canManageInvitations ? (
                  <TableCell className="text-right">
                    <InvitationActions
                      invitation={invitation}
                      canManageInvitations={canManageInvitations}
                    />
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={canManageInvitations ? 4 : 3}>
                <Empty className="border-0 p-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Mail className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No pending invitations</EmptyTitle>
                    <EmptyDescription>
                      All invitations have been accepted or canceled.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
