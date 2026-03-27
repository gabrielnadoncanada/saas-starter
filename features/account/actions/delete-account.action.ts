"use server";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth";
import { deleteAccount } from "@/features/account/server/delete-account";
import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";
import { db } from "@/shared/lib/db/prisma";

export const deleteAccountAction = validatedAuthenticatedAction<
  typeof deleteAccountSchema,
  {}
>(
  deleteAccountSchema,
  async (_, __, user) => {
    const reqHeaders = await headers();

    const result = await deleteAccount({
      id: user.id,
      email: user.email,
    }, reqHeaders);

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
        headers: reqHeaders,
      });
    } catch {
      // Session may already be invalidated
    }

    return result;
  },
);
