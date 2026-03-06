import { ActivityType, Prisma } from '@prisma/client';
import { db } from '@/lib/db/prisma';
import type { OAuthProviderId } from '@/lib/auth/providers';

const CREDENTIALS_PROVIDER = 'credentials';

async function getUserTeamIdWithinTransaction(
  tx: Prisma.TransactionClient,
  userId: number
) {
  const teamMember = await tx.teamMember.findFirst({
    where: {
      userId
    },
    select: {
      teamId: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  return teamMember?.teamId ?? null;
}

export async function getLinkedAccountsOverview(
  userId: number,
  oauthProviders: OAuthProviderId[]
) {
  const authAccounts = await db.authAccount.findMany({
    where: {
      userId
    },
    select: {
      provider: true,
      createdAt: true
    }
  });

  const hasPassword = authAccounts.some(
    (authAccount) => authAccount.provider === CREDENTIALS_PROVIDER
  );

  const linkedProviders = new Map(
    authAccounts.flatMap((authAccount) =>
      oauthProviders.includes(authAccount.provider as OAuthProviderId)
        ? [[authAccount.provider as OAuthProviderId, authAccount.createdAt] as const]
        : []
    )
  );

  const availableAuthMethodCount =
    (hasPassword ? 1 : 0) + linkedProviders.size;

  return {
    hasPassword,
    availableAuthMethodCount,
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;
      const canUnlink = availableAuthMethodCount > 1;

      return {
        provider,
        linkedAt,
        isLinked: linkedAt !== null,
        canUnlink
      };
    })
  };
}

export async function linkOAuthAccountToUser(params: {
  userId: number;
  provider: OAuthProviderId;
  providerAccountId: string;
  accountType: string;
}) {
  return db.$transaction(async (tx) => {
    const existingLinkedAccount = await tx.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: params.providerAccountId
        }
      }
    });

    if (
      existingLinkedAccount &&
      existingLinkedAccount.userId !== params.userId
    ) {
      return { status: 'conflict' as const };
    }

    const existingProviderForUser = await tx.authAccount.findFirst({
      where: {
        userId: params.userId,
        provider: params.provider
      }
    });

    if (existingProviderForUser) {
      if (existingProviderForUser.providerAccountId === params.providerAccountId) {
        return { status: 'already-linked' as const };
      }

      return { status: 'provider-already-linked' as const };
    }

    await tx.authAccount.create({
      data: {
        userId: params.userId,
        provider: params.provider,
        providerAccountId: params.providerAccountId,
        accountType: params.accountType
      }
    });

    const teamId = await getUserTeamIdWithinTransaction(tx, params.userId);

    if (teamId) {
      await tx.activityLog.create({
        data: {
          teamId,
          userId: params.userId,
          action: ActivityType.LINK_AUTH_PROVIDER,
          ipAddress: ''
        }
      });
    }

    return { status: 'linked' as const };
  });
}

export async function unlinkOAuthAccountForUser(params: {
  userId: number;
  provider: OAuthProviderId;
}) {
  return db.$transaction(async (tx) => {
    const authAccounts = await tx.authAccount.findMany({
      where: {
        userId: params.userId
      },
      select: {
        id: true,
        provider: true
      }
    });

    const targetAccount = authAccounts.find(
      (authAccount) => authAccount.provider === params.provider
    );

    if (!targetAccount) {
      return { status: 'not-found' as const };
    }

    const availableAuthMethodCount = authAccounts.length;

    if (availableAuthMethodCount <= 1) {
      return { status: 'last-method' as const };
    }

    await tx.authAccount.delete({
      where: {
        id: targetAccount.id
      }
    });

    const teamId = await getUserTeamIdWithinTransaction(tx, params.userId);

    if (teamId) {
      await tx.activityLog.create({
        data: {
          teamId,
          userId: params.userId,
          action: ActivityType.UNLINK_AUTH_PROVIDER,
          ipAddress: ''
        }
      });
    }

    return { status: 'unlinked' as const };
  });
}
