"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  DataTableContent,
  DataTablePagination,
} from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  deleteOrganizationAction,
  getOrganizationDetailAction,
} from "@/features/admin/actions/organizations.actions";
import {
  ADMIN_ORGANIZATIONS_TABLE_PAGE_SIZES,
  type AdminOrganizationsTableSearchParams,
  adminOrganizationsTableSearchParams,
  buildAdminOrganizationsTableHref,
} from "@/features/admin/admin-organizations-table-search-params";
import { getAdminOrganizationsColumns } from "@/features/admin/components/admin-organizations-table-columns";
import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/admin/types/organizations.types";
import { useServerTable } from "@/hooks/use-server-table";

import { AdminOrganizationDetailSheet } from "./organization-detail-sheet";

type AdminOrganizationsPageData = AdminOrganizationsTableSearchParams & {
  rows: AdminOrganization[];
  rowCount: number;
  pageCount: number;
};

type AdminOrganizationsTableProps = {
  currentUserId: string;
  organizationsPage: AdminOrganizationsPageData;
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

const sortableColumns = ["name", "createdAt"];

export function AdminOrganizationsTable({
  currentUserId,
  organizationsPage,
}: AdminOrganizationsTableProps) {
  const { rows, rowCount, pageCount, ...tableParams } = organizationsPage;
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [{ q: searchInput }, setSearchQuery] = useQueryStates(
    {
      q: adminOrganizationsTableSearchParams.q,
      page: adminOrganizationsTableSearchParams.page,
    },
    { shallow: false, throttleMs: 300 },
  );

  const [selectedOrganization, setSelectedOrganization] =
    useState<AdminOrganization | null>(null);
  const [subscription, setSubscription] = useState<OrgSubscription>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(emptyConfirmState);

  function viewerBelongsToOrganization(organization: AdminOrganization) {
    return organization.members.some(
      (member) => member.userId === currentUserId,
    );
  }

  function refreshPage() {
    startTransition(() => router.refresh());
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
          setDetailOpen(false);
          refreshPage();
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

  const columns = useMemo(
    () => getAdminOrganizationsColumns({ currentUserId, onDelete: confirmDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId],
  );

  const table = useServerTable({
    data: rows,
    columns,
    pageCount,
    params: tableParams,
    buildHref: buildAdminOrganizationsTableHref,
    sortableColumns,
    pageSizes: ADMIN_ORGANIZATIONS_TABLE_PAGE_SIZES,
    getRowId: (organization) => organization.id,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search organizations..."
          value={searchInput}
          onChange={(event) =>
            setSearchQuery({ q: event.target.value, page: 1 })
          }
        />
      </div>

      <DataTableContent
        table={table}
        onRowClick={(row) => openOrganizationDetail(row.original)}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          {rowCount === 1 ? "1 organization" : `${rowCount} organizations`}
        </p>
        <DataTablePagination table={table} className="mt-auto w-full px-0" />
      </div>

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
    </div>
  );
}
