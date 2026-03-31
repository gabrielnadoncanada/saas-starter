import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import type { UpdateAccountActionState } from "@/features/account/types/account.types";

type UpdateAccountParams = {
  name: string;
  phoneNumber: string | null;
};

export async function updateAccount({
  name,
  phoneNumber,
}: UpdateAccountParams): Promise<UpdateAccountActionState> {
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
}
