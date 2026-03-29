"use server";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { listAdminUsers } from "@/features/users/server/list-admin-users";
import type { ListAdminUsersQuery } from "@/features/users/types/admin-users.types";

export async function listUsersAction(query: ListAdminUsersQuery) {
  await requireAdminAction();
  return listAdminUsers(query);
}
