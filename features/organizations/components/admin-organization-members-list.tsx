"use client";

import { format } from "date-fns";

import type { OrgMember } from "@/features/organizations/types/admin-organizations.types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";

type AdminOrganizationMembersListProps = {
  members: OrgMember[];
};

export function AdminOrganizationMembersList({
  members,
}: AdminOrganizationMembersListProps) {
  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={member.user.image ?? undefined}
              alt={member.user.name ?? member.user.email}
            />
            <AvatarFallback>
              {(member.user.name || member.user.email)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {member.user.name || member.user.email}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {member.user.email}
            </p>
          </div>

          <div className="text-right">
            <Badge variant="secondary">{member.role}</Badge>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {format(new Date(member.createdAt), "MMM yyyy")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
