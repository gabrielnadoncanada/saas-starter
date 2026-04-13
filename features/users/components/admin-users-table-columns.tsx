"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Copy } from "lucide-react";

import type { AdminApiUser } from "@/shared/lib/auth/better-auth-inferred-types";
import { DataTableColumnHeader } from "@/shared/components/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

import { AdminUserRowActions } from "./admin-user-row-actions";

export type AdminUsersRowHandlers = {
  currentUserId: string;
  onCopyEmail: (email: string) => void;
  onSetRole: (userId: string, role: "user" | "admin") => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onRemove: (userId: string) => void;
};

function UserCell({
  row,
  onCopyEmail,
}: {
  row: Row<AdminApiUser>;
  onCopyEmail: (email: string) => void;
}) {
  const user = row.original;

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage
          src={user.image ?? undefined}
          alt={user.name ?? user.email}
        />
        <AvatarFallback>
          {(user.name || user.email)[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name || "No name"}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="truncate">{user.email}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={(event) => {
              event.stopPropagation();
              onCopyEmail(user.email);
            }}
          >
            <Copy className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function getAdminUsersColumns(
  handlers: AdminUsersRowHandlers,
): ColumnDef<AdminApiUser>[] {
  return [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => (
        <UserCell row={row} onCopyEmail={handlers.onCopyEmail} />
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.role ?? "user"}</Badge>
      ),
      enableSorting: false,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.banned ? "destructive" : "secondary"}>
          {row.original.banned ? "Banned" : "Active"}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.id !== handlers.currentUserId ? (
          <div onClick={(event) => event.stopPropagation()}>
            <AdminUserRowActions
              user={row.original}
              onSetRole={handlers.onSetRole}
              onBan={handlers.onBan}
              onUnban={handlers.onUnban}
              onRemove={handlers.onRemove}
            />
          </div>
        ) : null,
    },
  ];
}
