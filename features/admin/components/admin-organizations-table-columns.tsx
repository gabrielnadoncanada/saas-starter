"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Building2, MoreVertical, Trash2, Users } from "lucide-react";

import type { AdminOrganization } from "@/features/admin/types/organizations.types";
import { DataTableColumnHeader } from "@/shared/components/data-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export type AdminOrganizationsRowHandlers = {
  currentUserId: string;
  onDelete: (organization: AdminOrganization) => void;
};

export function getAdminOrganizationsColumns(
  handlers: AdminOrganizationsRowHandlers,
): ColumnDef<AdminOrganization>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      cell: ({ row }) => {
        const organization = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{organization.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {organization.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "members",
      header: "Members",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="size-4 text-muted-foreground" />
          {row.original._count.members}
        </div>
      ),
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
      cell: ({ row }) => {
        const organization = row.original;
        const ownOrganization = organization.members.some(
          (member) => member.userId === handlers.currentUserId,
        );

        return (
          <div onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={ownOrganization}
                  onClick={() => handlers.onDelete(organization)}
                >
                  <Trash2 className="size-4" />
                  {ownOrganization
                    ? "Cannot delete own org"
                    : "Delete organization"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
