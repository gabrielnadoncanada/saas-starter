"use server";

import { validatedAction } from "@/shared/lib/actions/validated-action";
import { resetPasswordSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { resetPassword } from "@/features/auth/server/reset-password";

export const resetPasswordAction = validatedAction(
  resetPasswordSchema,
  async (data) => resetPassword(data),
);
