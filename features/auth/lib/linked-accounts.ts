import { ActivityType } from '@prisma/client';

import { db } from '@/lib/db/prisma';
import type { OAuthProviderId } from '@/lib/auth/providers';
import { getUserTeamId } from '@/features/auth/lib/auth-activity';

export async function getLinkedAccountsOverview(
  userId: number,
  oauthProviders: OAuthProviderId[]
) {
  const accounts = await db.account.findMany({
    where: {
      userId,
      provider: {
        in: oauthProviders
      }
    },
    select: {
      provider: true,
      createdAt: true
    }
  });

  const linkedProviders = new Map(
    accounts.map((account) => [account.provider as OAuthProviderId, account.createdAt] as const)
  );

  return {
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;

      return {
        provider,
        linkedAt,
        isLinked: linkedAt !== null,
        canUnlink: linkedAt !== null
      };
    })
  };
}

export async function unlinkOAuthAccountForUser(params: {
  userId: number;
  provider: OAuthProviderId;
}) {
  const targetAccount = await db.account.findFirst({
    where: {
      userId: params.userId,
      provider: params.provider
    },
    select: {
      id: true
    }
  });

  if (!targetAccount) {
    return { status: 'not-found' as const };
  }

  await db.account.delete({
    where: { id: targetAccount.id }
  });

  const teamId = await getUserTeamId(params.userId);

  if (teamId) {
    await db.activityLog.create({
      data: {
        teamId,
        userId: params.userId,
        action: ActivityType.UNLINK_AUTH_PROVIDER,
        ipAddress: ''
      }
    });
  }

  return { status: 'unlinked' as const };
}
