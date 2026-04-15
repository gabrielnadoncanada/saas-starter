import { UserPlus } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import type { OrganizationMemberView } from "@/features/organizations/types";

type DashboardWorkspaceCardProps = {
  workspaceName: string;
  members: OrganizationMemberView[];
};

function getInitials(member: OrganizationMemberView) {
  const label = member.user.name?.trim() || member.user.email;
  const parts = label.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardWorkspaceCard({
  workspaceName,
  members,
}: DashboardWorkspaceCardProps) {
  const visible = members.slice(0, 5);
  const extra = Math.max(0, members.length - visible.length);

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      <div className="border-b border-border p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <p className="mt-2 truncate text-lg font-semibold tracking-[-0.01em]">
          {workspaceName}
        </p>
        <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="flex-1 p-5">
        {members.length > 0 ? (
          <ul className="space-y-3">
            {members.slice(0, 4).map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Avatar className="size-8 border border-border">
                  <AvatarImage
                    src={member.user.image ?? undefined}
                    alt={member.user.name ?? member.user.email}
                  />
                  <AvatarFallback className="text-[10px] font-medium">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.name ?? member.user.email}
                  </p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {member.primaryRole}
                  </p>
                </div>
              </li>
            ))}
            {extra > 0 ? (
              <li className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center border border-dashed border-border font-mono text-[10px] tabular-nums text-muted-foreground">
                  +{extra}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {extra} more
                </p>
              </li>
            ) : null}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-[22ch] text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Invite your first teammate to get started
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-between font-mono text-[11px] uppercase tracking-[0.18em]"
        >
          <Link href={routes.settings.members}>
            <span className="flex items-center gap-2">
              <UserPlus className="size-3.5" />
              Invite member
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
