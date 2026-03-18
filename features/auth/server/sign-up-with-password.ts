import { Prisma } from "@prisma/client";
import type { SignUpWithPasswordInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { SignUpWithPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { createAuthToken } from "@/features/auth/server/auth-tokens";
import { sendVerificationEmail } from "@/features/auth/server/auth-emails";
import { signUpRateLimiter } from "@/features/auth/server/auth-rate-limit";
import { hashPassword, normalizeEmail } from "@/features/auth/server/passwords";
import { db } from "@/shared/lib/db/prisma";

const VERIFY_EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function signUpWithPassword(
  input: SignUpWithPasswordInput,
): Promise<SignUpWithPasswordActionState> {
  const email = normalizeEmail(input.email);
  const rateLimit = signUpRateLimiter.check(`signup:${email}`);

  if (!rateLimit.allowed) {
    return {
      error: "Too many sign-up attempts. Please try again later.",
      values: { ...input, email },
    };
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const existingUser = await db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (existingUser?.emailVerified) {
      return {
        error: "An account already exists with this email.",
        values: { ...input, email, password: "", confirmPassword: "" },
        fieldErrors: {
          email: ["This email is already in use."],
        },
      };
    }

    const user = existingUser
      ? await db.user.update({
          where: { id: existingUser.id },
          data: {
            name: input.name,
            passwordHash,
            passwordUpdatedAt: new Date(),
          },
          select: {
            id: true,
          },
        })
      : await db.user.create({
          data: {
            name: input.name,
            email,
            passwordHash,
            passwordUpdatedAt: new Date(),
          },
          select: {
            id: true,
          },
        });

    const { token } = await createAuthToken({
      userId: user.id,
      type: "VERIFY_EMAIL",
      expiresInMs: VERIFY_EMAIL_TOKEN_TTL_MS,
    });

    await sendVerificationEmail({
      email,
      token,
      flow: {
        redirect: input.redirect ?? null,
        priceId: input.priceId ?? null,
        pricingModel: input.pricingModel ?? null,
        inviteId: input.inviteId ?? null,
      },
    });

    return {};
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "An account already exists with this email.",
        values: { ...input, email, password: "", confirmPassword: "" },
        fieldErrors: {
          email: ["This email is already in use."],
        },
      };
    }

    throw error;
  }
}
