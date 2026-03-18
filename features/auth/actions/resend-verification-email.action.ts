"use server";

import { validatedAction } from "@/shared/lib/actions/validated-action";
import { resendVerificationEmailSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { resendVerificationEmail } from "@/features/auth/server/resend-verification-email";

export const resendVerificationEmailAction = validatedAction(
  resendVerificationEmailSchema,
  async (data) => resendVerificationEmail(data),
);
