"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminConfirmDialog } from "@/shared/components/dialogs/admin-confirm-dialog";
import { AdminTablePagination } from "@/shared/components/app/admin-table-pagination";
import {
  banUserAction,
  getUserDetailAction,
  listUsersAction,
  removeUserAction,
  revokeAllUserSessionsAction,
  setUserRoleAction,
  unbanUserAction,
} from "@/features/users/actions/admin-users.actions";
import { authClient } from "@/shared/lib/auth/auth-client";
import { Table, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { UserDetailSheet } from "./user-detail-sheet";
import { UsersSearchInput } from "./users-search-input";
import { UsersTableRows } from "./users-table-rows";
import type { AdminConfirmState } from "@/shared/components/dialogs/admin-confirm-dialog";
import type { AdminUser, UserSession } from "@/features/users/types/admin-users.types";
type AdminUsersTableProps = {
  currentUserId: string;
  initialTotal: number;
  initialUsers: AdminUser[];
  pageSize: number;
};

const emptyConfirmState: AdminConfirmState = {
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
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] =
    useState<AdminConfirmState>(emptyConfirmState);
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;
  function fetchUsers(nextOffset: number, searchValue?: string) {
    startTransition(async () => {
      try {
        const result = await listUsersAction({
          limit: pageSize,
          offset: nextOffset,
          ...(searchValue
            ? {
                searchValue,
                searchField: "email",
                searchOperator: "contains",
              }
            : {}),
        });

        setUsers(result.users as AdminUser[]);
        setTotal(result.total);
        setOffset(nextOffset);
      } catch {
        toast.error("Failed to fetch users");
      }
    });
  }

  function handleSearch(value: string) {
    setSearch(value);
    fetchUsers(0, value);
  }
  async function openUserDetail(user: AdminUser) {
    setSelectedUser(user);
    setSheetOpen(true);
    setLoadingDetail(true);

    try {
      const detail = await getUserDetailAction(user.id);
      const sessions = Array.isArray(detail.sessions)
        ? detail.sessions
        : ((detail.sessions as { sessions?: UserSession[] }).sessions ?? []);

      if (detail.user) {
        setSelectedUser(detail.user as AdminUser);
      }

      setUserSessions(sessions as UserSession[]);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setLoadingDetail(false);
    }
  }
  function withConfirmation(
    title: string,
    description: string,
    action: () => Promise<void>,
  ) {
    setConfirmDialog({ open: true, title, description, action });
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
  return (
    <>
      <UsersSearchInput value={search} onChange={handleSearch} />
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
            onBan={(userId) =>
              withConfirmation(
                "Ban user",
                "This will ban the user and revoke all their sessions. Are you sure?",
                async () => {
                  await banUserAction(userId);
                  toast.success("User banned");
                  fetchUsers(offset, search);
                  setSheetOpen(false);
                },
              )
            }
            onCopy={copyToClipboard}
            onImpersonate={handleImpersonate}
            onOpen={openUserDetail}
            onRemove={(userId) =>
              withConfirmation(
                "Delete user",
                "This will permanently delete this user and all their data. This cannot be undone.",
                async () => {
                  await removeUserAction(userId);
                  toast.success("User deleted");
                  fetchUsers(offset, search);
                  setSheetOpen(false);
                },
              )
            }
            onSetRole={(userId, role) =>
              withConfirmation(
                `Set role to "${role}"`,
                `Are you sure you want to change this user's role to "${role}"?`,
                async () => {
                  await setUserRoleAction(userId, role);
                  toast.success("Role updated");
                  fetchUsers(offset, search);
                  setSheetOpen(false);
                },
              )
            }
            onUnban={(userId) =>
              withConfirmation(
                "Unban user",
                "This will unban the user and allow them to sign in again.",
                async () => {
                  await unbanUserAction(userId);
                  toast.success("User unbanned");
                  fetchUsers(offset, search);
                  setSheetOpen(false);
                },
              )
            }
            users={users}
          />
        </Table>
      </div>

      <AdminTablePagination
        currentPage={currentPage}
        disabled={isPending}
        offset={offset}
        onChange={(nextOffset) => fetchUsers(nextOffset, search)}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />
      <UserDetailSheet
        currentUserId={currentUserId}
        loadingDetail={loadingDetail}
        onImpersonate={handleImpersonate}
        onOpenChange={setSheetOpen}
        onRevokeAllSessions={(userId) =>
          withConfirmation(
            "Revoke all sessions",
            "This will sign the user out of all devices.",
            async () => {
              await revokeAllUserSessionsAction(userId);
              toast.success("All sessions revoked");
              setUserSessions([]);
            },
          )
        }
        open={sheetOpen}
        selectedUser={selectedUser}
        sessions={userSessions}
        copyToClipboard={copyToClipboard}
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

