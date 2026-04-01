"use server";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { deleteAccount } from "@/features/account/server/delete-account";
import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const deleteAccountAction = validatedAuthenticatedAction<
  typeof deleteAccountSchema,
  {}
>(
  deleteAccountSchema,
  async (_, __, user) => {
    const requestHeaders = await headers();

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