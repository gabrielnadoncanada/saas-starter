"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  banUserAction,
  getAdminUserDetailAction,
  removeUserAction,
  revokeAllUserSessionsAction,
  setUserRoleAction,
  unbanUserAction,
} from "@/features/users/actions/admin-users.actions";
import {
  ADMIN_USERS_TABLE_PAGE_SIZES,
  type AdminUsersTableSearchParams,
  adminUsersTableSearchParams,
  buildAdminUsersTableHref,
} from "@/features/users/admin-users-table-search-params";
import { getAdminUsersColumns } from "@/features/users/components/admin-users-table-columns";
import {
  DataTableContent,
  DataTablePagination,
} from "@/shared/components/data-table";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { Input } from "@/shared/components/ui/input";
import { useServerTable } from "@/shared/hooks/use-server-table";
import type {
  AdminApiSession,
  AdminApiUser,
} from "@/shared/lib/auth/better-auth-inferred-types";

import { AdminUserDetailSheet } from "./admin-user-detail-sheet";

type AdminUsersPageData = AdminUsersTableSearchParams & {
  rows: AdminApiUser[];
  rowCount: number;
  pageCount: number;
};

type AdminUsersTableProps = {
  currentUserId: string;
  usersPage: AdminUsersPageData;
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

const sortableColumns = ["email", "createdAt"];

export function AdminUsersTable({
  currentUserId,
  usersPage,
}: AdminUsersTableProps) {
  const { rows, rowCount, pageCount, ...tableParams } = usersPage;
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [{ q: searchInput }, setSearchQuery] = useQueryStates(
    {
      q: adminUsersTableSearchParams.q,
      page: adminUsersTableSearchParams.page,
    },
    { shallow: false, throttleMs: 300 },
  );

  const [selectedUser, setSelectedUser] = useState<AdminApiUser | null>(null);
  const [sessions, setSessions] = useState<AdminApiSession[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(emptyConfirmState);

  function copyToClipboard(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  function openConfirmation(
    title: string,
    description: string,
    action: () => Promise<void>,
  ) {
    setConfirmDialog({ open: true, title, description, action });
  }

  function refreshPage() {
    startTransition(() => router.refresh());
  }

  function closeUserDetailAndRefresh() {
    setIsSheetOpen(false);
    refreshPage();
  }

  async function openUserDetail(user: AdminApiUser) {
    setSelectedUser(user);
    setSessions([]);
    setIsSheetOpen(true);
    setIsLoadingUserDetail(true);

    try {
      const detail = await getAdminUserDetailAction(user.id);

      if (detail.user) {
        setSelectedUser(detail.user);
      }

      setSessions(detail.sessions);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setIsLoadingUserDetail(false);
    }
  }

  const columns = useMemo(
    () =>
      getAdminUsersColumns({
        currentUserId,
        onCopyEmail: copyToClipboard,
        onSetRole: (userId, role) =>
          openConfirmation(
            `Set role to "${role}"`,
            `Are you sure you want to change this user's role to "${role}"?`,
            async () => {
              await setUserRoleAction(userId, role);
              toast.success("Role updated");
              closeUserDetailAndRefresh();
            },
          ),
        onBan: (userId) =>
          openConfirmation(
            "Ban user",
            "This will ban the user and revoke all their sessions. Are you sure?",
            async () => {
              await banUserAction(userId);
              toast.success("User banned");
              closeUserDetailAndRefresh();
            },
          ),
        onUnban: (userId) =>
          openConfirmation(
            "Unban user",
            "This will unban the user and allow them to sign in again.",
            async () => {
              await unbanUserAction(userId);
              toast.success("User unbanned");
              closeUserDetailAndRefresh();
            },
          ),
        onRemove: (userId) =>
          openConfirmation(
            "Delete user",
            "This will permanently delete this user and all their data. This cannot be undone.",
            async () => {
              await removeUserAction(userId);
              toast.success("User deleted");
              closeUserDetailAndRefresh();
            },
          ),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId],
  );

  const table = useServerTable({
    data: rows,
    columns,
    pageCount,
    params: tableParams,
    buildHref: buildAdminUsersTableHref,
    sortableColumns,
    pageSizes: ADMIN_USERS_TABLE_PAGE_SIZES,
    getRowId: (user) => user.id,
  });

  function confirmRevokeAllSessions(userId: string) {
    openConfirmation(
      "Revoke all sessions",
      "This will sign the user out of all devices.",
      async () => {
        await revokeAllUserSessionsAction(userId);
        toast.success("All sessions revoked");
        setSessions([]);
      },
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search users by email..."
          value={searchInput}
          onChange={(event) =>
            setSearchQuery({ q: event.target.value, page: 1 })
          }
        />
      </div>

      <DataTableContent
        table={table}
        onRowClick={(row) => openUserDetail(row.original)}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          {rowCount === 1 ? "1 user" : `${rowCount} users`}
        </p>
        <DataTablePagination table={table} className="mt-auto w-full px-0" />
      </div>

      <AdminUserDetailSheet
        copyToClipboard={copyToClipboard}
        currentUserId={currentUserId}
        loadingDetail={isLoadingUserDetail}
        onOpenChange={setIsSheetOpen}
        onRevokeAllSessions={confirmRevokeAllSessions}
        open={isSheetOpen}
        selectedUser={selectedUser}
        sessions={sessions}
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
