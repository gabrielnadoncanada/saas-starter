import { createHash, randomBytes } from 'node:crypto';

import { db } from '@/lib/db/prisma';
import { getAppBaseUrl } from '@/lib/email/config';
import { sendEmailVerificationEmail as deliverEmailVerificationEmail } from '@/lib/email/senders';

const EMAIL_VERIFICATION_TTL_HOURS = 24;

type EmailVerificationOptions = {
  redirect?: string | null;
  priceId?: string | null;
};

export type EmailVerificationRequestResult = {
  success:
    'If an account exists for this email, a verification link has been sent.';
  email: '';
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function buildEmailVerificationUrl(
  rawToken: string,
  options: EmailVerificationOptions = {}
) {
  const url = new URL('/verify-email', getAppBaseUrl());
  url.searchParams.set('token', rawToken);

  if (options.redirect === 'checkout') {
    url.searchParams.set('redirect', options.redirect);
  }

  if (options.priceId) {
    url.searchParams.set('priceId', options.priceId);
  }

  return url.toString();
}

async function createEmailVerificationTokenForUser(
  userId: number,
  options: EmailVerificationOptions = {}
) {
  const user = await db.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      deletedAt: true,
      emailVerifiedAt: true
    }
  });

  if (!user || user.deletedAt || user.emailVerifiedAt) {
    return null;
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000);

  await db.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: user.id
      }
    });

    await tx.emailVerificationToken.create({
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
    verificationUrl: buildEmailVerificationUrl(rawToken, options)
  };
}

export async function createEmailVerificationToken(
  email: string,
  options: EmailVerificationOptions = {}
) {
  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!user) {
    return null;
  }

  return createEmailVerificationTokenForUser(user.id, options);
}

export async function createEmailVerificationTokenForNewUser(
  userId: number,
  options: EmailVerificationOptions = {}
) {
  return createEmailVerificationTokenForUser(userId, options);
}

export async function getValidEmailVerificationToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  return db.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date()
      },
      user: {
        deletedAt: null,
        emailVerifiedAt: null
      }
    },
    include: {
      user: true
    }
  });
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const emailVerificationToken = await getValidEmailVerificationToken(rawToken);

  if (!emailVerificationToken) {
    return null;
  }

  const verifiedAt = new Date();

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: emailVerificationToken.userId
      },
      data: {
        emailVerifiedAt: verifiedAt
      }
    });

    await tx.emailVerificationToken.update({
      where: {
        id: emailVerificationToken.id
      },
      data: {
        usedAt: verifiedAt
      }
    });

    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: emailVerificationToken.userId,
        id: {
          not: emailVerificationToken.id
        }
      }
    });
  });

  return {
    ...emailVerificationToken.user,
    emailVerifiedAt: verifiedAt
  };
}

export async function sendEmailVerificationEmail(email: string, verificationUrl: string) {
  await deliverEmailVerificationEmail(email, verificationUrl);
}

export function createRequestEmailVerificationHandler(dependencies = {
  createEmailVerificationToken,
  sendEmailVerificationEmail
}) {
  return async function requestEmailVerificationForEmail(
    email: string,
    options: EmailVerificationOptions = {}
  ): Promise<EmailVerificationRequestResult> {
    const verification = await dependencies.createEmailVerificationToken(email, options);

    if (verification) {
      try {
        await dependencies.sendEmailVerificationEmail(
          verification.email,
          verification.verificationUrl
        );
      } catch (error) {
        console.error('[auth:email-verification.email-failed]', {
          email: verification.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success:
        'If an account exists for this email, a verification link has been sent.',
      email: ''
    };
  };
}

export const requestEmailVerificationForEmail = createRequestEmailVerificationHandler();
