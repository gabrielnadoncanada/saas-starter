"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmDialog } from "@/shared/components/dialogs/admin-confirm-dialog";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import {
  deleteOrganizationAction,
  getOrganizationDetailAction,
  listOrganizationsAction,
} from "@/features/organizations/actions/organization-admin.actions";
import { Input } from "@/shared/components/ui/input";
import { Table, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { OrganizationDetailSheet } from "./organization-detail-sheet";
import { OrganizationsTableRows } from "./organizations-table-rows";
import type { AdminConfirmState } from "@/shared/components/dialogs/admin-confirm-dialog";
import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/organizations/types/admin-organizations.types";

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

  function fetchOrganizations(nextOffset: number, searchValue?: string) {
    startTransition(async () => {
      try {
        const result = await listOrganizationsAction({
          limit: pageSize,
          offset: nextOffset,
          search: searchValue,
        });

        setOrganizations(result.organizations as AdminOrganization[]);
        setTotal(result.total);
        setOffset(nextOffset);
      } catch {
        toast.error("Failed to fetch organizations");
      }
    });
  }

  function handleSearch(value: string) {
    setSearch(value);
    fetchOrganizations(0, value);
  }

  function isOwnOrganization(organization: AdminOrganization) {
    return organization.members.some((member) => member.userId === currentUserId);
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
          fetchOrganizations(offset, search);
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
          <OrganizationsTableRows
            isOwnOrganization={isOwnOrganization}
            isPending={isPending}
            onDelete={confirmDelete}
            onOpen={openOrganizationDetail}
            organizations={organizations}
          />
        </Table>
      </div>

      <AdminTablePagination
        currentPage={currentPage}
        disabled={isPending}
        offset={offset}
        onChange={(nextOffset) => fetchOrganizations(nextOffset, search)}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />

      <OrganizationDetailSheet
        loadingDetail={loadingDetail}
        onDelete={confirmDelete}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
        organization={selectedOrganization}
        subscription={organizationSubscription}
        isOwnOrganization={isOwnOrganization}
      />

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



