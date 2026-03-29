"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/shared/lib/auth";

export async function unbanUserAction(userId: string) {
  await requireAdminAction();

  await auth.api.unbanUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
