"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { getAdminUserDetail } from "@/features/users/server/get-admin-user-detail";
import { listAdminUsers } from "@/features/users/server/list-admin-users";
import type { ListAdminUsersQuery } from "@/features/users/types/admin-users.types";
import { auth } from "@/shared/lib/auth/auth-config";

function revalidateAdminUsersPage() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function listAdminUsersAction(query: ListAdminUsersQuery) {
  await requireAdminAction();
  return listAdminUsers(query);
}

export async function getAdminUserDetailAction(userId: string) {
  await requireAdminAction();
  return getAdminUserDetail(userId);
}

export async function banUserAction(
  userId: string,
  banReason?: string,
  banExpiresIn?: number,
) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot ban yourself");
  }

  await auth.api.banUser({
    body: {
      userId,
      ...(banReason ? { banReason } : {}),
      ...(banExpiresIn ? { banExpiresIn } : {}),
    },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}

export async function unbanUserAction(userId: string) {
  await requireAdminAction();

  await auth.api.unbanUser({
    body: { userId },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}

export async function removeUserAction(userId: string) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot delete your own account from the admin panel");
  }

  await auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}

export async function setUserRoleAction(
  userId: string,
  role: "user" | "admin",
) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot change your own role");
  }

  await auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}

export async function revokeUserSessionAction(sessionToken: string) {
  await requireAdminAction();

  await auth.api.revokeUserSession({
    body: { sessionToken },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}

export async function revokeAllUserSessionsAction(userId: string) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot revoke your own sessions from the admin panel");
  }

  await auth.api.revokeUserSessions({
    body: { userId },
    headers: await headers(),
  });

  revalidateAdminUsersPage();
}
