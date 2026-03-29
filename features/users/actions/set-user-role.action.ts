"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/shared/lib/auth";

export async function setUserRoleAction(userId: string, role: "user" | "admin") {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot change your own role");
  }

  await auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
