"use server";

import { signOut } from "@/auth";
import { deleteAccount } from "@/features/account/server/delete-account";
import { deleteAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const deleteAccountAction = validatedActionWithUser(
  deleteAccountSchema,
  async (_, __, user) => {
    const result = await deleteAccount({
      id: user.id,
      email: user.email,
    });

    if (result?.error) {
      return result;
    }

    await signOut({ redirect: false });

    return result;
  },
);
