"use server";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { updateAccount } from "@/features/auth/server/update-account";
import { updateAccountSchema } from "@/features/auth/schemas/account.schema";

export const updateAccountAction = validatedActionWithUser(
  updateAccountSchema,
  async ({ name, email }, _, user) =>
    updateAccount({ userId: user.id, name, email }),
);
