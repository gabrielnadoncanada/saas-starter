import { ActivityType } from "@/shared/lib/db/enums";
import { hasMagicLinkProvider } from "@/shared/lib/auth/providers";

import { createActivityLog } from "@/shared/lib/activity-log";
import {
  OAUTH_PROVIDER_LABELS,
  type OAuthProviderId,
} from "@/shared/lib/auth/oauth-config";
import { db } from "@/shared/lib/db/prisma";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

const ALL_OAUTH_PROVIDER_IDS = Object.keys(
  OAUTH_PROVIDER_LABELS,
) as OAuthProviderId[];

export async function getLinkedAccountsOverview(
  userId: number,
  oauthProviders: OAuthProviderId[],
) {
  const [accounts, user] = await Promise.all([
    db.account.findMany({
      where: {
        userId,
        provider: { in: oauthProviders },
      },
      select: {
        provider: true,
        createdAt: true,
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
      },
    }),
  ]);

  const linkedProviders = new Map(
    accounts.map((account) => [
      account.provider as OAuthProviderId,
      account.createdAt,
    ]),
  );

  const linkedCount = accounts.length;
  const hasFallbackMethod = Boolean(user?.passwordHash) || hasMagicLinkProvider();

  return {
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;
      const isLinked = linkedAt !== null;

      return {
        provider,
        linkedAt,
        isLinked,
        canUnlink: isLinked && (linkedCount > 1 || hasFallbackMethod),
      };
    }),
  };
}

type UnlinkOAuthAccountParams = {
  userId: number;
  provider: OAuthProviderId;
};

export async function unlinkOAuthAccountForUser(
  params: UnlinkOAuthAccountParams,
) {
  const [linkedAccounts, user] = await Promise.all([
    db.account.findMany({
      where: {
        userId: params.userId,
        provider: { in: ALL_OAUTH_PROVIDER_IDS },
      },
      select: {
        id: true,
        provider: true,
      },
    }),
    db.user.findUnique({
      where: { id: params.userId },
      select: {
        passwordHash: true,
      },
    }),
  ]);

  const targetAccount = linkedAccounts.find(
    (account) => account.provider === params.provider,
  );

  if (!targetAccount) {
    return { status: "not-found" as const };
  }

  // Block unlink if this is the last linked account — prevents lockout
  const hasFallbackMethod = Boolean(user?.passwordHash) || hasMagicLinkProvider();

  if (linkedAccounts.length <= 1 && !hasFallbackMethod) {
    return { status: "blocked" as const };
  }

  await db.account.delete({
    where: { id: targetAccount.id },
  });

  const membership = await getUserTeamMembership(params.userId);

  await createActivityLog({
    teamId: membership?.teamId,
    userId: params.userId,
    action: ActivityType.UNLINK_AUTH_PROVIDER,
  });

  return { status: "unlinked" as const };
}
