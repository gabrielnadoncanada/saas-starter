"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { Copy } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AdminApiUser } from "@/lib/auth/better-auth-inferred-types";
import { formatShortDate } from "@/lib/date/format-date";
import { getInitials } from "@/lib/user/get-initials";
import { cn } from "@/lib/utils";

import { UserRowActions } from "./user-row-actions";

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
      <Avatar className="border border-border">
        <AvatarImage
          src={user.image ?? undefined}
          alt={user.name ?? user.email}
        />
        <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name || "No name"}</p>
        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
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

function MetaTag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        tone === "brand" && "border-brand/40 bg-brand/5 text-brand",
        tone === "danger" &&
          "border-destructive/40 bg-destructive/5 text-destructive",
        tone === "neutral" && "border-border bg-background text-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5",
          tone === "brand" && "bg-brand",
          tone === "danger" && "bg-destructive",
          tone === "neutral" && "bg-muted-foreground/50",
        )}
      />
      {children}
    </span>
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
      cell: ({ row }) => {
        const role = row.original.role ?? "user";
        return (
          <MetaTag tone={role === "admin" ? "brand" : "neutral"}>
            {role}
          </MetaTag>
        );
      },
      enableSorting: false,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <MetaTag tone={row.original.banned ? "danger" : "neutral"}>
          {row.original.banned ? "Banned" : "Active"}
        </MetaTag>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatShortDate(row.original.createdAt)}
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
            <UserRowActions
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
