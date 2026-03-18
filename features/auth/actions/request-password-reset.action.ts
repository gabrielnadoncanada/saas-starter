"use server";

import { validatedAction } from "@/shared/lib/actions/validated-action";
import { forgotPasswordSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { requestPasswordReset } from "@/features/auth/server/request-password-reset";

export const requestPasswordResetAction = validatedAction(
  forgotPasswordSchema,
  async (data) => requestPasswordReset(data),
);
