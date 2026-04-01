"use server";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { updateAccountSchema } from "@/features/account/schemas/account.schema";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { UpdateAccountActionState } from "@/features/account/types/account.types";

export const updateAccountAction = validatedAuthenticatedAction(
  updateAccountSchema,
  async ({ name, phoneNumber }): Promise<UpdateAccountActionState> => {
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name,
        phoneNumber,
      },
    });

    return {
      success: "Account updated successfully.",
      values: {
        name,
        phoneNumber,
      },
    };
  },
);