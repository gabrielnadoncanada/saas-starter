"use client";

import { format } from "date-fns";
import {
  Building2,
  Calendar,
  MoreVertical,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteOrganizationAction,
  getOrganizationDetailAction,
  listOrganizationsAction,
} from "@/features/organizations/actions/organization-admin.actions";
import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/organizations/types/admin-organizations.types";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import type { AdminConfirmState } from "@/shared/components/dialogs/admin-confirm-dialog";
import { AdminConfirmDialog } from "@/shared/components/dialogs/admin-confirm-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type AdminOrganizationsTableProps = {
  currentUserId: string;
  initialOrganizations: AdminOrganization[];
  initialTotal: number;
  pageSize: number;
};

const emptyConfirmState: AdminConfirmState = {
  open: false,
  title: "",
  description: "",
  action: async () => {},
};

export function AdminOrganizationsTable({
  currentUserId,
  initialOrganizations,
  initialTotal,
  pageSize,
}: AdminOrganizationsTableProps) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedOrganization, setSelectedOrganization] =
    useState<AdminOrganization | null>(null);
  const [organizationSubscription, setOrganizationSubscription] =
    useState<OrgSubscription>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] =
    useState<AdminConfirmState>(emptyConfirmState);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  function isOwnOrganization(organization: AdminOrganization) {
    return organization.members.some(
      (member) => member.userId === currentUserId,
    );
  }

  function fetchOrganizations(nextOffset: number, nextSearch = search) {
    startTransition(async () => {
      try {
        const result = await listOrganizationsAction({
          limit: pageSize,
          offset: nextOffset,
          search: nextSearch,
        });

        setOrganizations(result.organizations as AdminOrganization[]);
        setTotal(result.total);
        setOffset(nextOffset);
      } catch {
        toast.error("Failed to fetch organizations");
      }
    });
  }

  function handleSearch(nextSearch: string) {
    setSearch(nextSearch);
    fetchOrganizations(0, nextSearch);
  }

  async function openOrganizationDetail(organization: AdminOrganization) {
    setSelectedOrganization(organization);
    setOrganizationSubscription(null);
    setSheetOpen(true);
    setLoadingDetail(true);

    try {
      const detail = await getOrganizationDetailAction(organization.id);
      setSelectedOrganization(detail.organization as AdminOrganization);
      setOrganizationSubscription(detail.subscription as OrgSubscription);
    } catch {
      toast.error("Failed to load organization details");
    } finally {
      setLoadingDetail(false);
    }
  }

  function confirmDelete(organization: AdminOrganization) {
    setConfirmDialog({
      open: true,
      title: `Delete "${organization.name}"`,
      description:
        "This will permanently delete this organization, all its members, tasks, and data. This cannot be undone.",
      action: async () => {
        try {
          await deleteOrganizationAction(organization.id);
          toast.success("Organization deleted");
          fetchOrganizations(offset);
          setSheetOpen(false);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to delete organization",
          );
        }
      },
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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
                const ownOrganization = isOwnOrganization(organization);

                return (
                  <TableRow
                    key={organization.id}
                    className={isPending ? "opacity-50" : "cursor-pointer"}
                    onClick={() => openOrganizationDetail(organization)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                          <Building2 className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {organization.name}
                          </p>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              disabled={ownOrganization}
                              onClick={() => confirmDelete(organization)}
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

      <AdminTablePagination
        currentPage={currentPage}
        disabled={isPending}
        offset={offset}
        onChange={(nextOffset) => fetchOrganizations(nextOffset)}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {selectedOrganization ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                    <Building2 className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <SheetTitle>{selectedOrganization.name}</SheetTitle>
                    <SheetDescription>
                      {selectedOrganization.slug}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 overflow-y-auto">
                <Card>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="size-4 text-muted-foreground" />
                        {selectedOrganization._count.members} member
                        {selectedOrganization._count.members === 1 ? "" : "s"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-4 text-muted-foreground" />
                        Created{" "}
                        {format(
                          new Date(selectedOrganization.createdAt),
                          "MMMM d, yyyy",
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="mb-3 font-semibold">Subscription</h3>
                  <Card>
                    <CardContent>
                      {loadingDetail ? (
                        <p className="text-sm text-muted-foreground">
                          Loading...
                        </p>
                      ) : organizationSubscription ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {organizationSubscription.plan}
                            </span>
                            <Badge variant="secondary">
                              {organizationSubscription.status}
                            </Badge>
                          </div>
                          {organizationSubscription.periodEnd ? (
                            <p className="text-sm text-muted-foreground">
                              Renews{" "}
                              {format(
                                new Date(organizationSubscription.periodEnd),
                                "MMMM d, yyyy",
                              )}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No active subscription
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Members</h3>
                  <div className="space-y-4">
                    {selectedOrganization.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={member.user.image ?? undefined}
                            alt={member.user.name ?? member.user.email}
                          />
                          <AvatarFallback>
                            {(member.user.name ||
                              member.user.email)[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.user.name || member.user.email}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{member.role}</Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Joined{" "}
                            {format(new Date(member.createdAt), "MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {!isOwnOrganization(selectedOrganization) ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => confirmDelete(selectedOrganization)}
                  >
                    <Trash2 className="size-4" />
                    Delete Organization
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        state={confirmDialog}
        onOpenChange={(open) =>
          setConfirmDialog((current) => ({ ...current, open }))
        }
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog(emptyConfirmState);
        }}
      />
    </>
  );
}
