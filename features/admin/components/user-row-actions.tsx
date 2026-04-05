"use client";

import {
  MoreVertical,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
} from "lucide-react";

import type { AdminUser } from "@/features/admin/types/admin-users.types";
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
  user: AdminUser;
  onSetRole: (userId: string, role: "user" | "admin") => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onRemove: (userId: string) => void;
  onImpersonate: (userId: string) => void;
};

export function UserRowActions({
  user,
  onSetRole,
  onBan,
  onUnban,
  onRemove,
  onImpersonate,
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
        <DropdownMenuItem onClick={() => onImpersonate(user.id)}>
          <UserCheck className="size-4" />
          Impersonate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

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
