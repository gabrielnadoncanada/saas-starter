import { createHash, randomBytes } from 'node:crypto';

import { db } from '@/lib/db/prisma';
import { getAppBaseUrl } from '@/lib/email/config';
import { sendPasswordResetEmail as deliverPasswordResetEmail } from '@/lib/email/senders';

const PASSWORD_RESET_TTL_MINUTES = 60;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export type PasswordResetRequestResult = {
  success:
    'If an account exists for this email, a password reset link has been sent.';
  email: '';
};

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
      where: { userId: user.id }
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
    resetUrl: `${getAppBaseUrl()}/reset-password?token=${rawToken}`
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
  await deliverPasswordResetEmail(email, resetUrl);
}

export function createRequestPasswordResetHandler(dependencies = {
  createPasswordResetToken,
  sendPasswordResetEmail
}) {
  return async function requestPasswordResetForEmail(
    email: string
  ): Promise<PasswordResetRequestResult> {
    const passwordReset = await dependencies.createPasswordResetToken(email);

    if (passwordReset) {
      try {
        await dependencies.sendPasswordResetEmail(
          passwordReset.email,
          passwordReset.resetUrl
        );
      } catch (error) {
        console.error('[auth:password-reset.email-failed]', {
          email: passwordReset.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success:
        'If an account exists for this email, a password reset link has been sent.',
      email: ''
    };
  };
}

export const requestPasswordResetForEmail = createRequestPasswordResetHandler();
