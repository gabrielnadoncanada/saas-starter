"use client";

import { format } from "date-fns";
import { Building2, MoreVertical, Trash2, Users } from "lucide-react";

import type { AdminOrganization } from "@/features/organizations/types/admin-organizations.types";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type AdminOrganizationsTableContentProps = {
  currentUserId: string;
  isPending: boolean;
  onDelete: (organization: AdminOrganization) => void;
  onOpen: (organization: AdminOrganization) => void;
  organizations: AdminOrganization[];
};

function viewerBelongsToOrganization(
  organization: AdminOrganization,
  currentUserId: string,
) {
  return organization.members.some((member) => member.userId === currentUserId);
}

export function AdminOrganizationsTableContent({
  currentUserId,
  isPending,
  onDelete,
  onOpen,
  organizations,
}: AdminOrganizationsTableContentProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No organizations found.
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((organization) => {
              const ownOrganization = viewerBelongsToOrganization(
                organization,
                currentUserId,
              );

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
      </Table>
    </div>
  );
}
