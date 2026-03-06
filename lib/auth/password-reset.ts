import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db/prisma';

const PASSWORD_RESET_TTL_MINUTES = 60;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getBaseUrl() {
  return process.env.BASE_URL || process.env.AUTH_URL || 'http://localhost:3000';
}

export async function createPasswordResetToken(email: string) {
  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null
    },
    select: {
      id: true,
      email: true
    }
  });

  if (!user) {
    return null;
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

  await db.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: {
        userId: user.id
      }
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });
  });

  return {
    email: user.email,
    token: rawToken,
    expiresAt,
    resetUrl: `${getBaseUrl()}/reset-password?token=${rawToken}`
  };
}

export async function getValidPasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  return db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date()
      },
      user: {
        deletedAt: null
      }
    },
    include: {
      user: true
    }
  });
}

export async function consumePasswordResetToken(rawToken: string, passwordHash: string) {
  const passwordResetToken = await getValidPasswordResetToken(rawToken);

  if (!passwordResetToken) {
    return null;
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: passwordResetToken.userId
      },
      data: {
        passwordHash
      }
    });

    await tx.passwordResetToken.update({
      where: {
        id: passwordResetToken.id
      },
      data: {
        usedAt: new Date()
      }
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: passwordResetToken.userId,
        id: {
          not: passwordResetToken.id
        }
      }
    });
  });

  return passwordResetToken.user;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  console.info(`Password reset requested for ${email}: ${resetUrl}`);
}
