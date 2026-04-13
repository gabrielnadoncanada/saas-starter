"use client";

import {
  MoreVertical,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import type { AdminApiUser } from "@/shared/lib/auth/better-auth-inferred-types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";

type UserRowActionsProps = {
  user: AdminApiUser;
  onSetRole: (userId: string, role: "user" | "admin") => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onRemove: (userId: string) => void;
};

export function AdminUserRowActions({
  user,
  onSetRole,
  onBan,
  onUnban,
  onRemove,
}: UserRowActionsProps) {
  const isAdmin = isPlatformAdmin(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreVertical className="size-4" />
          <span className="sr-only">User actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAdmin ? (
          <DropdownMenuItem onClick={() => onSetRole(user.id, "user")}>
            <ShieldOff className="size-4" />
            Remove admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onSetRole(user.id, "admin")}>
            <ShieldCheck className="size-4" />
            Make admin
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {user.banned ? (
          <DropdownMenuItem onClick={() => onUnban(user.id)}>
            <ShieldCheck className="size-4" />
            Unban user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onBan(user.id)}>
            <ShieldBan className="size-4" />
            Ban user
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onRemove(user.id)}
        >
          <Trash2 className="size-4" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
