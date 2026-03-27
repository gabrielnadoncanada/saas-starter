"use client";

import { format } from "date-fns";
import { Copy } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { UserRowActions } from "./user-row-actions";
import type { AdminUser } from "../users.types";

type UsersTableRowsProps = {
  currentUserId: string;
  isPending: boolean;
  onBan: (userId: string) => void;
  onCopy: (value: string) => void;
  onImpersonate: (userId: string) => void;
  onOpen: (user: AdminUser) => void;
  onRemove: (userId: string) => void;
  onSetRole: (userId: string, role: "user" | "admin") => void;
  onUnban: (userId: string) => void;
  users: AdminUser[];
};

export function UsersTableRows({
  currentUserId,
  isPending,
  onBan,
  onCopy,
  onImpersonate,
  onOpen,
  onRemove,
  onSetRole,
  onUnban,
  users,
}: UsersTableRowsProps) {
  return (
    <TableBody>
      {users.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            No users found.
          </TableCell>
        </TableRow>
      ) : (
        users.map((user) => (
          <TableRow
            key={user.id}
            className={isPending ? "opacity-50" : "cursor-pointer"}
            onClick={() => onOpen(user)}
          >
            <TableCell>
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
                        onCopy(user.email);
                      }}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{user.role ?? "user"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.banned ? "destructive" : "secondary"}>
                {user.banned ? "Banned" : "Active"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(user.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              {user.id !== currentUserId ? (
                <div onClick={(event) => event.stopPropagation()}>
                  <UserRowActions
                    user={user}
                    onSetRole={onSetRole}
                    onBan={onBan}
                    onUnban={onUnban}
                    onRemove={onRemove}
                    onImpersonate={onImpersonate}
                  />
                </div>
              ) : null}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );
}
