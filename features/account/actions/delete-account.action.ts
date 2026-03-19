"use server";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth";
import { deleteAccount } from "@/features/account/server/delete-account";
import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { db } from "@/shared/lib/db/prisma";

export const deleteAccountAction = validatedActionWithUser<
  typeof deleteAccountSchema,
  {}
>(
  deleteAccountSchema,
  async (_, __, user) => {
    const result = await deleteAccount({
      id: user.id,
      email: user.email,
    });

    if (result?.error) {
      return result;
    }

    // Revoke all sessions for this user
    await db.session.deleteMany({
      where: { userId: user.id },
    });

    // Sign out the current session
    try {
      await auth.api.signOut({
        headers: await headers(),
      });
    } catch {
      // Session may already be invalidated
    }

    return result;
  },
);
