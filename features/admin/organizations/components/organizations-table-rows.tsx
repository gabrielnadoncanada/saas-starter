"use client";

import { format } from "date-fns";
import { Building2, MoreVertical, Trash2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import type { AdminOrganization } from "../organizations.types";

type OrganizationsTableRowsProps = {
  isOwnOrganization: (organization: AdminOrganization) => boolean;
  isPending: boolean;
  onDelete: (organization: AdminOrganization) => void;
  onOpen: (organization: AdminOrganization) => void;
  organizations: AdminOrganization[];
};

export function OrganizationsTableRows({
  isOwnOrganization,
  isPending,
  onDelete,
  onOpen,
  organizations,
}: OrganizationsTableRowsProps) {
  return (
    <TableBody>
      {organizations.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center">
            No organizations found.
          </TableCell>
        </TableRow>
      ) : (
        organizations.map((organization) => {
          const ownOrganization = isOwnOrganization(organization);

          return (
            <TableRow
              key={organization.id}
              className={isPending ? "opacity-50" : "cursor-pointer"}
              onClick={() => onOpen(organization)}
            >
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="size-4 text-muted-foreground" />
                  {organization._count.members}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(organization.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
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
                        onClick={() => onDelete(organization)}
                      >
                        <Trash2 className="size-4" />
                        {ownOrganization
                          ? "Cannot delete own org"
                          : "Delete organization"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
}
