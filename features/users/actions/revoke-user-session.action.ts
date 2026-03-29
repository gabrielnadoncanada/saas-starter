"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { auth } from "@/shared/lib/auth";

export async function revokeUserSessionAction(sessionToken: string) {
  await requireAdminAction();

  await auth.api.revokeUserSession({
    body: { sessionToken },
    headers: await headers(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
