import { ArrowRight, UserPlus, Users } from "lucide-react";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import type { OrganizationMemberView } from "@/features/organizations/types";

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

export function DashboardMembersCard({ members }: DashboardMembersCardProps) {
  const visibleMembers = members.slice(0, 3);
  const extraMemberCount = Math.max(0, members.length - visibleMembers.length);
  const memberLabel = members.length === 1 ? "member" : "members";
  const leadMember = members[0];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Workspace & Members</CardDescription>
        <CardAction>
          <Badge variant="secondary">{`${members.length} ${memberLabel}`}</Badge>
        </CardAction>
        <CardTitle>
          <Users className="size-5 text-primary" />
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
                <AvatarFallback>{getMemberInitials(member)}</AvatarFallback>
              </Avatar>
            ))}

            {extraMemberCount > 0 ? (
              <AvatarGroupCount>+{extraMemberCount}</AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">
            {leadMember ? "Workspace owner" : "Team status"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {leadMember
              ? (leadMember.user.name ?? leadMember.user.email)
              : "Invite teammates to collaborate here."}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={routes.settings.members}>
            <span className="flex items-center gap-2">
              <UserPlus />
              Invite member
            </span>
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
