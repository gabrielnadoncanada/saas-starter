"use server";

import { updateAccount } from "@/features/account/server/update-account";
import { updateAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const updateAccountAction = validatedActionWithUser(
  updateAccountSchema,
  async ({ name, phoneNumber }) => {
    return updateAccount({
      name,
      phoneNumber,
    });
  },
);
