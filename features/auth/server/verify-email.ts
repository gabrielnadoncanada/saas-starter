import { db } from "@/shared/lib/db/prisma";
import { consumeAuthToken } from "@/features/auth/server/auth-tokens";

export async function verifyEmailAddress(token: string) {
  const authToken = await consumeAuthToken({
    token,
    type: "VERIFY_EMAIL",
  });

  if (!authToken) {
    return {
      status: "invalid" as const,
    };
  }

  await db.user.update({
    where: { id: authToken.userId },
    data: {
      emailVerified: new Date(),
    },
  });

  return {
    status: "verified" as const,
  };
}
