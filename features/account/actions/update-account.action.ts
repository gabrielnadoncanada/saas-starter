"use server";

import { updateAccount } from "@/features/account/server/update-account";
import { updateAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const updateAccountAction = validatedActionWithUser(
  updateAccountSchema,
  async ({ name, email, phoneNumber }, _formData, user) => {
    return updateAccount({
      userId: user.id,
      name,
      email,
      phoneNumber,
    });
  },
);
