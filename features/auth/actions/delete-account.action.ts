"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { deleteAccount } from "@/features/auth/server/delete-account";
import { deleteAccountSchema } from "@/features/auth/schemas/account.schema";

export const deleteAccountAction = validatedActionWithUser(
  deleteAccountSchema,
  async (_, __, user) => deleteAccount(user),
);
