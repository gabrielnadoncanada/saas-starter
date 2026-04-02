"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteOrganizationAction,
  getOrganizationDetailAction,
  listOrganizationsAction,
} from "@/features/organizations/actions/organization-admin.actions";
import { AdminOrganizationDetailSheet } from "@/features/organizations/components/admin-organization-detail-sheet";
import { AdminOrganizationsSearch } from "@/features/organizations/components/admin-organizations-search";
import { AdminOrganizationsTableContent } from "@/features/organizations/components/admin-organizations-table-content";
import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/organizations/types/admin-organizations.types";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";

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
  const t = useTranslations("organizations");
  const tc = useTranslations("common");
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
    return organization.members.some((member) => member.userId === currentUserId);
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
        toast.error(t("table.fetchFailed"));
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
      setSelectedOrganization(detail.organization as AdminOrganization);
      setSubscription(detail.subscription as OrgSubscription);
    } catch {
      toast.error(t("table.detailFailed"));
    } finally {
      setLoadingDetail(false);
    }
  }

  function confirmDelete(organization: AdminOrganization) {
    setConfirmDialog({
      open: true,
      title: t("table.deleteConfirmTitle", { name: organization.name }),
      description: t("table.deleteConfirmMessage"),
      action: async () => {
        try {
          await deleteOrganizationAction(organization.id);
          toast.success(t("table.deleteSuccess"));
          fetchOrganizations(offset);
          setDetailOpen(false);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t("table.deleteFailed"),
          );
        }
      },
    });
  }

  return (
    <>
      <AdminOrganizationsSearch
        value={search}
        onChange={(nextSearch) => {
          setSearch(nextSearch);
          fetchOrganizations(0, nextSearch);
        }}
      />

      <AdminOrganizationsTableContent
        currentUserId={currentUserId}
        isPending={isPending}
        onDelete={confirmDelete}
        onOpen={openOrganizationDetail}
        organizations={organizations}
      />

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
        confirmText={tc("dialogConfirm")}
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
