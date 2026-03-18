import { db } from "@/shared/lib/db/prisma";
import type { ResendVerificationEmailInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { ResendVerificationEmailActionState } from "@/features/auth/types/credentials-auth.types";
import { createAuthToken } from "@/features/auth/server/auth-tokens";
import { sendVerificationEmail } from "@/features/auth/server/auth-emails";
import { resendVerificationRateLimiter } from "@/features/auth/server/auth-rate-limit";
import { normalizeEmail } from "@/features/auth/server/passwords";

const VERIFY_EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function resendVerificationEmail(
  input: ResendVerificationEmailInput,
): Promise<ResendVerificationEmailActionState> {
  const email = normalizeEmail(input.email);
  const rateLimit = resendVerificationRateLimiter.check(`verify:${email}`);

  if (!rateLimit.allowed) {
    return {
      error: "Too many verification emails requested. Please try again later.",
      values: { ...input, email },
    };
  }

  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null,
      emailVerified: null,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    return {
      success: "If an unverified account exists, a new verification email has been sent.",
      values: { ...input, email },
    };
  }

  const { token } = await createAuthToken({
    userId: user.id,
    type: "VERIFY_EMAIL",
    expiresInMs: VERIFY_EMAIL_TOKEN_TTL_MS,
  });

  await sendVerificationEmail({
    email: user.email,
    token,
    flow: {
      redirect: input.redirect ?? null,
      priceId: input.priceId ?? null,
      pricingModel: input.pricingModel ?? null,
      inviteId: input.inviteId ?? null,
    },
  });

  return {
    success: "A new verification email has been sent.",
    values: { ...input, email },
  };
}
