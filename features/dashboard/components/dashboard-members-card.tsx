import { UserPlus, Users } from "lucide-react";
import Link from "next/link";

import type { OrganizationMemberView } from "@/features/organizations/types";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";

type DashboardMembersCardProps = {
  members: OrganizationMemberView[];
};

function getMemberInitials(member: OrganizationMemberView) {
  const label = member.user.name?.trim() || member.user.email;
  const parts = label.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardMembersCard({
  members,
}: DashboardMembersCardProps) {
  const visibleMembers = members.slice(0, 3);
  const extraMemberCount = Math.max(0, members.length - visibleMembers.length);
  const memberLabel = members.length === 1 ? "member" : "members";

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardDescription>Workspace & Members</CardDescription>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5 text-orange-500" />
          Members
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-2xl font-semibold">
          {members.length}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {memberLabel}
          </span>
        </p>

        <div className="flex items-center justify-between gap-3">
          <AvatarGroup>
            {visibleMembers.map((member) => (
              <Avatar key={member.id}>
                <AvatarImage
                  src={member.user.image ?? undefined}
                  alt={member.user.name ?? member.user.email}
                />
                <AvatarFallback>
                  {getMemberInitials(member)}
                </AvatarFallback>
              </Avatar>
            ))}

            {extraMemberCount > 0 ? (
              <AvatarGroupCount>+{extraMemberCount}</AvatarGroupCount>
            ) : null}
          </AvatarGroup>

          <Button asChild variant="outline" size="sm">
            <Link href={routes.settings.members}>
              <UserPlus />
              Invite member
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
