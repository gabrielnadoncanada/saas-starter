"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/lib/auth/auth-config";
import type { ListUsersQueryInput } from "@/lib/auth/better-auth-inferred-types";
import { db } from "@/lib/db/prisma";
import { throwIfDemo } from "@/lib/demo";

import { getAdminUserDetail, listAdminUsers } from "../server/users";

function revalidateAdminUsersPage() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function listAdminUsersAction(
  query: Partial<ListUsersQueryInput>,
) {
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
  throwIfDemo();
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
  throwIfDemo();
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

export async function impersonateUserAction(userId: string) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot impersonate yourself");
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!target) {
    throw new Error("User not found");
  }

  if (target.role === "admin") {
    throw new Error("You cannot impersonate another admin");
  }

  await auth.api.impersonateUser({
    body: { userId },
    headers: await headers(),
  });
}

export async function stopImpersonatingAction() {
  await auth.api.stopImpersonating({
    headers: await headers(),
  });
  redirect(routes.admin.users);
}
