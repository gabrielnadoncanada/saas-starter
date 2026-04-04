"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  banUserAction,
  getAdminUserDetailAction,
  listAdminUsersAction,
  removeUserAction,
  revokeAllUserSessionsAction,
  setUserRoleAction,
  unbanUserAction,
} from "@/features/users/actions/admin-users.actions";
import type {
  AdminUser,
  UserSession,
} from "@/features/users/types/admin-users.types";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useRouter } from "@/shared/i18n/navigation";
import { authClient } from "@/shared/lib/auth/auth-client";

import { AdminUsersSearch } from "./admin-users-search";
import { UserDetailSheet } from "./user-detail-sheet";
import { UsersTableRows } from "./users-table-rows";

type AdminUsersTableProps = {
  currentUserId: string;
  initialTotal: number;
  initialUsers: AdminUser[];
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

export function AdminUsersTable({
  currentUserId,
  initialTotal,
  initialUsers,
  pageSize,
}: AdminUsersTableProps) {
  const router = useRouter();
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(emptyConfirmState);
  const [isPending, startTransition] = useTransition();

  async function loadUsers(nextOffset: number, nextSearch = search) {
    try {
      const result = await listAdminUsersAction({
        limit: pageSize,
        offset: nextOffset,
        ...(nextSearch
          ? {
              searchField: "email" as const,
              searchOperator: "contains" as const,
              searchValue: nextSearch,
            }
          : {}),
      });
      setUsers(result.users as AdminUser[]);
      setTotal(result.total);
      setOffset(nextOffset);
    } catch {
      toast.error(t("errors.fetchFailed"));
    }
  }

  function runTableRefresh(nextOffset: number, nextSearch = search) {
    startTransition(async () => void (await loadUsers(nextOffset, nextSearch)));
  }

  function openConfirmation(title: string, description: string, action: () => Promise<void>) {
    setConfirmDialog({ open: true, title, description, action });
  }

  async function openUserDetail(user: AdminUser) {
    setSelectedUser(user);
    setSessions([]);
    setIsSheetOpen(true);
    setIsLoadingUserDetail(true);

    try {
      const detail = await getAdminUserDetailAction(user.id);

      if (detail.user) {
        setSelectedUser(detail.user as AdminUser);
      }

      setSessions(detail.sessions);
    } catch {
      toast.error(t("errors.detailFailed"));
    } finally {
      setIsLoadingUserDetail(false);
    }
  }

  async function handleImpersonate(userId: string) {
    const { error } = await authClient.admin.impersonateUser({ userId });

    if (error) {
      toast.error(error.message ?? t("errors.impersonateFailed"));
      return;
    }

    toast.success(t("errors.impersonateSuccess"));
    router.push("/dashboard");
    router.refresh();
  }

  function copyToClipboard(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success(tc("copiedToClipboard"));
  }

  function closeUserDetailAndRefresh() {
    setIsSheetOpen(false);
    runTableRefresh(offset);
  }

  function confirmBanUser(userId: string) {
    openConfirmation(
      t("confirmations.banTitle"),
      t("confirmations.banMessage"),
      async () => {
        await banUserAction(userId);
        toast.success(t("confirmations.banSuccess"));
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmDeleteUser(userId: string) {
    openConfirmation(
      t("confirmations.deleteTitle"),
      t("confirmations.deleteMessage"),
      async () => {
        await removeUserAction(userId);
        toast.success(t("confirmations.deleteSuccess"));
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmSetUserRole(userId: string, role: "user" | "admin") {
    openConfirmation(
      t("confirmations.roleTitle", { role }),
      t("confirmations.roleMessage", { role }),
      async () => {
        await setUserRoleAction(userId, role);
        toast.success(t("confirmations.roleSuccess"));
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmUnbanUser(userId: string) {
    openConfirmation(
      t("confirmations.unbanTitle"),
      t("confirmations.unbanMessage"),
      async () => {
        await unbanUserAction(userId);
        toast.success(t("confirmations.unbanSuccess"));
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmRevokeAllSessions(userId: string) {
    openConfirmation(
      t("confirmations.revokeTitle"),
      t("confirmations.revokeMessage"),
      async () => {
        await revokeAllUserSessionsAction(userId);
        toast.success(t("confirmations.revokeSuccess"));
        setSessions([]);
      },
    );
  }

  return (
    <>
      <AdminUsersSearch
        value={search}
        onChange={(value) => {
          setSearch(value);
          runTableRefresh(0, value);
        }}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnUser")}</TableHead>
              <TableHead>{t("columnRole")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead>{t("columnCreated")}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <UsersTableRows
            currentUserId={currentUserId}
            isPending={isPending}
            onBan={confirmBanUser}
            onCopy={copyToClipboard}
            onImpersonate={handleImpersonate}
            onOpen={openUserDetail}
            onRemove={confirmDeleteUser}
            onSetRole={confirmSetUserRole}
            onUnban={confirmUnbanUser}
            users={users}
          />
        </Table>
      </div>
      <AdminTablePagination
        currentPage={Math.floor(offset / pageSize) + 1}
        disabled={isPending}
        offset={offset}
        onChange={(nextOffset) => runTableRefresh(nextOffset)}
        pageSize={pageSize}
        total={total}
        totalPages={Math.ceil(total / pageSize)}
      />
      <UserDetailSheet
        copyToClipboard={copyToClipboard}
        currentUserId={currentUserId}
        loadingDetail={isLoadingUserDetail}
        onImpersonate={handleImpersonate}
        onOpenChange={setIsSheetOpen}
        onRevokeAllSessions={confirmRevokeAllSessions}
        open={isSheetOpen}
        selectedUser={selectedUser}
        sessions={sessions}
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
