import { db } from "@/shared/lib/db/prisma";
import { normalizeEmail, verifyPassword } from "@/features/auth/server/passwords";

export type CredentialsAuthResult =
  | { status: "invalid" }
  | { status: "email-not-verified" }
  | {
      status: "success";
      user: {
        id: string;
        email: string;
        name: string | null;
        platformRole: string;
      };
    };

export async function authenticatePasswordCredentials(input: {
  email: string;
  password: string;
}): Promise<CredentialsAuthResult> {
  const email = normalizeEmail(input.email);
  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      platformRole: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  if (!user?.passwordHash) {
    return { status: "invalid" };
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    return { status: "invalid" };
  }

  if (!user.emailVerified) {
    return { status: "email-not-verified" };
  }

  return {
    status: "success",
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
    },
  };
}
