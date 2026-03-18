import { createHash, randomBytes } from "node:crypto";
import type { AuthTokenType } from "@prisma/client";
import { db } from "@/shared/lib/db/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(input: {
  userId: number;
  type: AuthTokenType;
  expiresInMs: number;
}) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + input.expiresInMs);

  await db.$transaction([
    db.authToken.deleteMany({
      where: {
        userId: input.userId,
        type: input.type,
        consumedAt: null,
      },
    }),
    db.authToken.create({
      data: {
        userId: input.userId,
        type: input.type,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  return { token, expiresAt };
}

export async function consumeAuthToken(input: {
  token: string;
  type: AuthTokenType;
}) {
  const tokenHash = hashToken(input.token);
  const now = new Date();

  const authToken = await db.authToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      type: true,
      consumedAt: true,
      expiresAt: true,
    },
  });

  if (
    !authToken ||
    authToken.type !== input.type ||
    authToken.consumedAt !== null ||
    authToken.expiresAt <= now
  ) {
    return null;
  }

  const result = await db.authToken.updateMany({
    where: {
      id: authToken.id,
      consumedAt: null,
    },
    data: {
      consumedAt: now,
    },
  });

  if (result.count !== 1) {
    return null;
  }

  return authToken;
}
