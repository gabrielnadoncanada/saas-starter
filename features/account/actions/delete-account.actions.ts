"use server";

import { headers } from "next/headers";

import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { deleteAccount } from "@/features/account/server/delete-account";
import { logActivity } from "@/lib/activity/log-activity";
import { auth } from "@/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";

export const deleteAccountAction = validatedAuthenticatedAction(
  deleteAccountSchema,
  async (_, { user }) => {
    const requestHeaders = await headers();

    await logActivity({
      action: "user.deleted",
      actorUserId: user.id,
      targetType: "user",
      targetId: user.id,
      metadata: { email: user.email },
    });

    const result = await deleteAccount({
      userId: user.id,
      userEmail: user.email,
      requestHeaders,
    });

    if (result?.error) {
      return result;
    }

    try {
      await auth.api.signOut({
        headers: requestHeaders,
      });
    } catch {
      // Session may already be invalidated.
    }

    return result;
  },
);
