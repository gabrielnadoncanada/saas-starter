"use server";

import { updateAccount } from "@/features/account/server/update-account";
import { updateAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const updateAccountAction = validatedAuthenticatedAction(
  updateAccountSchema,
  async ({ name, phoneNumber }) => {
    return updateAccount({
      name,
      phoneNumber,
    });
  },
);
