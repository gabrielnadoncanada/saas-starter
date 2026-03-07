import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/session';

function isTrustedOAuthEmail(provider: string, profile?: Record<string, unknown> | null) {
  if (!profile) {
    return false;
  }

  if (provider === 'google') {
    return profile.email_verified === true;
  }

  if (provider === 'github') {
    return typeof profile.email === 'string' && profile.email.length > 0;
  }

  return false;
}

async function getLinkedUserByAccount(provider: string, providerAccountId: string) {
  const authAccount = await db.authAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId
      }
    },
    include: {
      user: true
    }
  });

  return authAccount?.user ?? null;
}

async function linkOAuthAccount(params: {
  userId: number;
  provider: string;
  providerAccountId: string;
  accountType: string;
}) {
  await db.authAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: params.provider,
        providerAccountId: params.providerAccountId
      }
    },
    update: {
      userId: params.userId,
      accountType: params.accountType
    },
    create: {
      userId: params.userId,
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      accountType: params.accountType
    }
  });
}

async function createUserFromOAuth(email: string, name: string | null) {
  const passwordHash = await hashPassword(randomBytes(32).toString('hex'));
  const emailVerifiedAt = new Date();

  return db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerifiedAt,
        role: 'owner'
      }
    });

    const createdTeam = await tx.team.create({
      data: {
        name: `${email}'s Team`
      }
    });

    await tx.teamMember.create({
      data: {
        userId: createdUser.id,
        teamId: createdTeam.id,
        role: 'owner'
      }
    });

    await tx.activityLog.createMany({
      data: [
        {
          teamId: createdTeam.id,
          userId: createdUser.id,
          action: 'CREATE_TEAM',
          ipAddress: ''
        },
        {
          teamId: createdTeam.id,
          userId: createdUser.id,
          action: 'SIGN_UP',
          ipAddress: ''
        }
      ]
    });

    return createdUser;
  });
}

export async function resolveOAuthUser(params: {
  provider: string;
  providerAccountId: string;
  accountType: string;
  email: string;
  name: string | null;
  profile?: Record<string, unknown> | null;
}) {
  const linkedUser = await getLinkedUserByAccount(
    params.provider,
    params.providerAccountId
  );

  if (linkedUser) {
    return linkedUser.deletedAt ? null : linkedUser;
  }

  const trustedEmail = isTrustedOAuthEmail(params.provider, params.profile);

  const existingUser = await db.user.findUnique({
    where: {
      email: params.email
    }
  });

  if (existingUser) {
    if (existingUser.deletedAt || !trustedEmail) {
      return null;
    }

    if (!existingUser.emailVerifiedAt) {
      await db.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          emailVerifiedAt: new Date()
        }
      });
      existingUser.emailVerifiedAt = new Date();
    }

    await linkOAuthAccount({
      userId: existingUser.id,
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      accountType: params.accountType
    });

    return existingUser;
  }

  if (!trustedEmail) {
    return null;
  }

  const createdUser = await createUserFromOAuth(params.email, params.name);

  await linkOAuthAccount({
    userId: createdUser.id,
    provider: params.provider,
    providerAccountId: params.providerAccountId,
    accountType: params.accountType
  });

  return createdUser;
}
