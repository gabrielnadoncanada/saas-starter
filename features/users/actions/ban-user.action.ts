"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/shared/lib/auth";

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

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
