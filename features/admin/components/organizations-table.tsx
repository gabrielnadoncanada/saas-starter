"use client";

import { format } from "date-fns";
import {
  Building2,
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
} from "@/features/admin/actions/organizations.actions";
import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/admin/types/organizations.types";
import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { AdminOrganizationDetailSheet } from "./organization-detail-sheet";

type AdminOrganizationsTableProps = {
  currentUserId: string;
  initialOrganizations: AdminOrganization[];
  initialTotal: number;
  pageSize: number;
};

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  action: () => Promise<void>;
};

const emptyConfirmState: ConfirmState = {
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
  const [selectedOrganization, setSelectedOrganization] =
    useState<AdminOrganization | null>(null);
  const [subscription, setSubscription] = useState<OrgSubscription>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(emptyConfirmState);
  const [isPending, startTransition] = useTransition();

  function viewerBelongsToOrganization(organization: AdminOrganization) {
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

        setOrganizations(result.organizations);
        setTotal(result.total);
        setOffset(nextOffset);
      } catch {
        toast.error("Failed to fetch organizations");
      }
    });
  }

  async function openOrganizationDetail(organization: AdminOrganization) {
    setSelectedOrganization(organization);
    setSubscription(null);
    setDetailOpen(true);
    setLoadingDetail(true);

    try {
      const detail = await getOrganizationDetailAction(organization.id);
      setSelectedOrganization(detail.organization);
      setSubscription(detail.subscription);
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
          setDetailOpen(false);
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search organizations..."
          value={search}
          onChange={(event) => {
            const nextSearch = event.target.value;
            setSearch(nextSearch);
            fetchOrganizations(0, nextSearch);
          }}
        />
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
                const ownOrganization =
                  viewerBelongsToOrganization(organization);

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
        currentPage={Math.floor(offset / pageSize) + 1}
        disabled={isPending}
        offset={offset}
        onChange={fetchOrganizations}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
      />

      <AdminOrganizationDetailSheet
        loading={loadingDetail}
        onDelete={confirmDelete}
        onOpenChange={setDetailOpen}
        open={detailOpen}
        organization={selectedOrganization}
        subscription={subscription}
        viewerBelongsToOrganization={viewerBelongsToOrganization}
      />

      <ConfirmDialog
        confirmText={"Confirm"}
        desc={confirmDialog.description}
        handleConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog(emptyConfirmState);
        }}
        onOpenChange={(open) =>
          setConfirmDialog((current) => ({ ...current, open }))
        }
        open={confirmDialog.open}
        title={confirmDialog.title}
      />
    </>
  );
}
