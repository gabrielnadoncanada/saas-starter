"use server";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { getAdminUserDetail } from "@/features/users/server/get-admin-user-detail";

export async function getUserDetailAction(userId: string) {
  await requireAdminAction();
  return getAdminUserDetail(userId);
}
