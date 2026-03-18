"use server";

import { cookies } from "next/headers";

import { signOut } from "@/auth";
import { deleteAccount } from "@/features/account/server/delete-account";
import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

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

    // Force-clear JWT cookies to prevent stale token usage
    const cookieStore = await cookies();
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    cookieStore.delete("active_team_id");

    await signOut({ redirect: false });

    return result;
  },
);
