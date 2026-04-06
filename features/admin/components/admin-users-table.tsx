"use client";

import { Search } from "lucide-react";
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
} from "@/features/admin/actions/admin-users.actions";
import type {
  AdminApiSession,
  AdminApiUser,
} from "@/shared/lib/auth/better-auth-inferred-types";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { UserDetailSheet } from "./user-detail-sheet";
import { UsersTableRows } from "./users-table-rows";

type AdminUsersTableProps = {
  currentUserId: string;
  initialTotal: number;
  initialUsers: AdminApiUser[];
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
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminApiUser | null>(null);
  const [sessions, setSessions] = useState<AdminApiSession[]>([]);
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
      setUsers(result.users);
      setTotal(result.total);
      setOffset(nextOffset);
    } catch {
      toast.error("Failed to fetch users");
    }
  }

  function runTableRefresh(nextOffset: number, nextSearch = search) {
    startTransition(async () => void (await loadUsers(nextOffset, nextSearch)));
  }

  function openConfirmation(
    title: string,
    description: string,
    action: () => Promise<void>,
  ) {
    setConfirmDialog({ open: true, title, description, action });
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

  function copyToClipboard(value: string) {
    void navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  function closeUserDetailAndRefresh() {
    setIsSheetOpen(false);
    runTableRefresh(offset);
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
      `Set role to "${role}"`,
      `Are you sure you want to change this user's role to "${role}"?`,
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
          placeholder="Search users..."
          value={search}
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value);
            runTableRefresh(0, value);
          }}
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
    </>
  );
}
