"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/shared/lib/auth";

export async function removeUserAction(userId: string) {
  const adminId = await requireAdminAction();

  if (userId === adminId) {
    throw new Error("You cannot delete your own account from the admin panel");
  }

  await auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
