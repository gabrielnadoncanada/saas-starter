"use server";

import { headers } from "next/headers";

import {
  type UpdateAccountInput,
  updateAccountSchema,
} from "@/features/account/schemas/account.schema";
import { auth } from "@/shared/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

export const updateAccountAction = validatedAuthenticatedAction(
  updateAccountSchema,
  async ({
    name,
    phoneNumber,
  }): Promise<FormActionState<UpdateAccountInput>> => {
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
