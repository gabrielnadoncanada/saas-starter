import { ActivityType } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import {
  hasMagicLinkProvider,
  OAUTH_PROVIDER_LABELS,
  type OAuthProviderId,
} from "@/lib/auth/providers";
import { createActivityLog } from "@/lib/activity-log";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";

const ALL_OAUTH_PROVIDER_IDS = Object.keys(
  OAUTH_PROVIDER_LABELS,
) as OAuthProviderId[];

export async function getLinkedAccountsOverview(
  userId: number,
  oauthProviders: OAuthProviderId[],
) {
  const accounts = await db.account.findMany({
    where: {
      userId,
      provider: { in: oauthProviders },
    },
    select: {
      provider: true,
      createdAt: true,
    },
  });

  const linkedProviders = new Map(
    accounts.map((account) => [
      account.provider as OAuthProviderId,
      account.createdAt,
    ]),
  );

  const linkedCount = accounts.length;
  const canUseMagicLink = hasMagicLinkProvider();

  return {
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;
      const isLinked = linkedAt !== null;

      return {
        provider,
        linkedAt,
        isLinked,
        canUnlink: isLinked && (canUseMagicLink || linkedCount > 1),
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
  const linkedAccounts = await db.account.findMany({
    where: {
      userId: params.userId,
      provider: { in: ALL_OAUTH_PROVIDER_IDS },
    },
    select: {
      id: true,
      provider: true,
    },
  });

  const targetAccount = linkedAccounts.find(
    (account) => account.provider === params.provider,
  );

  if (!targetAccount) {
    return { status: "not-found" as const };
  }

  if (!hasMagicLinkProvider() && linkedAccounts.length <= 1) {
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

