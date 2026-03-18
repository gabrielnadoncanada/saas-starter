import { db } from "@/shared/lib/db/prisma";
import type { ForgotPasswordInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { ForgotPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { createAuthToken } from "@/features/auth/server/auth-tokens";
import { sendPasswordResetEmail } from "@/features/auth/server/auth-emails";
import { forgotPasswordRateLimiter } from "@/features/auth/server/auth-rate-limit";
import { normalizeEmail } from "@/features/auth/server/passwords";

const RESET_PASSWORD_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordActionState> {
  const email = normalizeEmail(input.email);
  const rateLimit = forgotPasswordRateLimiter.check(`forgot:${email}`);

  if (!rateLimit.allowed) {
    return {
      error: "Too many reset attempts. Please try again later.",
      values: { email },
    };
  }

  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null,
      emailVerified: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (user) {
    const { token } = await createAuthToken({
      userId: user.id,
      type: "RESET_PASSWORD",
      expiresInMs: RESET_PASSWORD_TOKEN_TTL_MS,
    });

    await sendPasswordResetEmail({
      email: user.email,
      token,
    });
  }

  return {
    success: "If an account exists for this email, a reset link has been sent.",
    values: { email },
  };
}
