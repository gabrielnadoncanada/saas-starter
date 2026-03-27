"use client";

import { useActionState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Mail, MoreVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";

import type { CancelOrganizationInvitationActionState } from "@/features/teams/invitations/actions/cancel-organization-invitation.action";
import type { ResendOrganizationInvitationActionState } from "@/features/teams/invitations/actions/resend-organization-invitation.action";
import { cancelOrganizationInvitationAction } from "@/features/teams/invitations/actions/cancel-organization-invitation.action";
import { resendOrganizationInvitationAction } from "@/features/teams/invitations/actions/resend-organization-invitation.action";
import type { OrganizationInvitationView } from "@/features/teams/shared/types/organization.types";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type OrganizationInvitationsTableProps = {
  canManageInvitations: boolean;
  invitations: OrganizationInvitationView[];
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Pending";
  }

  return format(parseISO(value), "MMM d, yyyy");
}

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
    if (resendState.refreshKey || cancelState.refreshKey) {
      router.refresh();
    }
  }, [cancelState.refreshKey, resendState.refreshKey, router]);

  const feedback =
    cancelState.error ||
    cancelState.success ||
    resendState.error ||
    resendState.success;
  const isError = Boolean(cancelState.error || resendState.error);

  useToastMessage(feedback, {
    kind: isError ? "error" : "success",
    trigger: feedback,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <MoreVertical className="size-4" />
          <span className="sr-only">Open invitation actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canManageInvitations ? (
          <>
            <DropdownMenuItem asChild>
              <form action={resendAction} className="w-full">
                <input
                  type="hidden"
                  name="invitationId"
                  value={invitation.id}
                />
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-left"
                  disabled={isResending}
                >
                  <Mail className="size-4" />
                  {isResending ? "Resending..." : "Resend invite"}
                </button>
              </form>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={cancelAction} className="w-full">
                <input
                  type="hidden"
                  name="invitationId"
                  value={invitation.id}
                />
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-left"
                  disabled={isCanceling}
                >
                  <X className="size-4" />
                  {isCanceling ? "Canceling..." : "Cancel invite"}
                </button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            Only owners can manage invitations
          </DropdownMenuItem>
        )}
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
            <TableHead className="w-16 text-right" />
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
                  {formatDate(invitation.expiresAt)}
                </TableCell>
                <TableCell className="text-right">
                  <InvitationActions
                    invitation={invitation}
                    canManageInvitations={canManageInvitations}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
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
