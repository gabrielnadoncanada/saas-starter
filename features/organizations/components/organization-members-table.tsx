"use client";

import { format, parseISO } from "date-fns";
import { MoreVertical, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  removeOrganizationMemberAction,
  type RemoveOrganizationMemberActionState,
} from "@/features/organizations/actions/membership.actions";
import type { OrganizationMemberView } from "@/features/organizations/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { hasOrgRole } from "@/shared/lib/db/enums";

type OrganizationMembersTableProps = {
  currentUserId: string;
  canManageMembers: boolean;
  members: OrganizationMemberView[];
};

function getDisplayName(member: OrganizationMemberView) {
  return member.user.name || member.user.email || "Unknown User";
}

function getInitials(member: OrganizationMemberView) {
  return getDisplayName(member)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatJoinedAt(joinedAt?: string | null) {
  if (!joinedAt) {
    return "Unknown";
  }

  return format(parseISO(joinedAt), "MMM d, yyyy");
}

function MemberActions({
  member,
  currentUserId,
  canManageMembers,
}: {
  member: OrganizationMemberView;
  currentUserId: string;
  canManageMembers: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    RemoveOrganizationMemberActionState,
    FormData
  >(removeOrganizationMemberAction, {});

  const canRemoveMember =
    canManageMembers &&
    !hasOrgRole(member.roles, "owner") &&
    member.user.id !== currentUserId;

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
    }

    if (state.refreshKey) {
      router.refresh();
    }
  }, [router, state.error, state.fieldErrors, state.refreshKey, state.success]);

  if (!canRemoveMember) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <MoreVertical className="size-4" />
          <span className="sr-only">Open member actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <form action={formAction} className="w-full">
            <input type="hidden" name="memberId" value={member.id} />
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-left"
              disabled={isPending}
            >
              <UserMinus className="size-4" />
              {isPending ? "Removing..." : "Remove member"}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrganizationMembersTable({
  currentUserId,
  canManageMembers,
  members,
}: OrganizationMembersTableProps) {
  const showActionsColumn = members.some(
    (member) =>
      canManageMembers &&
      !hasOrgRole(member.roles, "owner") &&
      member.user.id !== currentUserId,
  );

  return (
    <div className="rounded-md border p-0.5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[52%]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {showActionsColumn ? (
              <TableHead className="w-16 text-right" />
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={member.user.image ?? undefined}
                      alt={getDisplayName(member)}
                    />
                    <AvatarFallback>{getInitials(member)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{getDisplayName(member)}</p>
                      {member.user.id === currentUserId ? (
                        <Badge variant="outline">You</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {member.primaryRole}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatJoinedAt(member.joinedAt)}
              </TableCell>
              {showActionsColumn ? (
                <TableCell className="text-right">
                  <MemberActions
                    member={member}
                    currentUserId={currentUserId}
                    canManageMembers={canManageMembers}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
