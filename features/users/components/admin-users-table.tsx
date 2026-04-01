"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { authClient } from "@/shared/lib/auth/auth-client";

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
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>(
    emptyConfirmState,
  );

  async function loadUsers(nextOffset: number, nextSearch: string) {
    try {
      const query = {
        limit: pageSize,
        offset: nextOffset,
        ...(nextSearch
          ? {
              searchField: "email" as const,
              searchOperator: "contains" as const,
              searchValue: nextSearch,
            }
          : {}),
      };

      const result = await listAdminUsersAction(query);

      setUsers(result.users as AdminUser[]);
      setTotal(result.total);
      setOffset(nextOffset);
    } catch {
      toast.error("Failed to fetch users");
    }
  }

  function refreshUsers() {
    startTransition(async () => {
      await loadUsers(offset, search);
    });
  }

  function goToPage(nextOffset: number) {
    startTransition(async () => {
      await loadUsers(nextOffset, search);
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);

    startTransition(async () => {
      await loadUsers(0, value);
    });
  }

  function openConfirmation(
    title: string,
    description: string,
    action: () => Promise<void>,
  ) {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
    });
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
      toast.error("Failed to load user details");
    } finally {
      setIsLoadingUserDetail(false);
    }
  }

  async function handleImpersonate(userId: string) {
    const { error } = await authClient.admin.impersonateUser({ userId });

    if (error) {
      toast.error(error.message ?? "Failed to impersonate user");
      return;
    }

    toast.success("Now impersonating user");
    router.push("/dashboard");
    router.refresh();
  }

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  function closeUserDetailAndRefresh() {
    setIsSheetOpen(false);
    refreshUsers();
  }

  function confirmBanUser(userId: string) {
    openConfirmation(
      "Ban user",
      "This will ban the user and revoke all their sessions. Are you sure?",
      async () => {
        await banUserAction(userId);
        toast.success("User banned");
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmDeleteUser(userId: string) {
    openConfirmation(
      "Delete user",
      "This will permanently delete this user and all their data. This cannot be undone.",
      async () => {
        await removeUserAction(userId);
        toast.success("User deleted");
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmSetUserRole(userId: string, role: "user" | "admin") {
    openConfirmation(
      `Set role to \"${role}\"`,
      `Are you sure you want to change this user's role to \"${role}\"?`,
      async () => {
        await setUserRoleAction(userId, role);
        toast.success("Role updated");
        closeUserDetailAndRefresh();
      },
    );
  }

  function confirmUnbanUser(userId: string) {
    openConfirmation(
      "Unban user",
      "This will unban the user and allow them to sign in again.",
      async () => {
        await unbanUserAction(userId);
        toast.success("User unbanned");
        closeUserDetailAndRefresh();
      },
    );
  }

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
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search users..."
          value={search}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
        onChange={goToPage}
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
        confirmText="Confirm"
        desc={confirmDialog.description}
        handleConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog(emptyConfirmState);
        }}
        onOpenChange={(open) => {
          setConfirmDialog((current) => ({
            ...current,
            open,
          }));
        }}
        open={confirmDialog.open}
        title={confirmDialog.title}
      />
    </>
  );
}
