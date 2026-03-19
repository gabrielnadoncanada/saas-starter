import { ActivityType } from "@/shared/lib/db/enums";
import { hasMagicLinkProvider } from "@/shared/lib/auth/oauth-config";

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
  userId: string,
  oauthProviders: OAuthProviderId[],
) {
  const [accounts, credentialAccount] = await Promise.all([
    db.account.findMany({
      where: {
        userId,
        providerId: { in: oauthProviders },
      },
      select: {
        providerId: true,
        createdAt: true,
      },
    }),
    db.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { id: true },
    }),
  ]);

  const linkedProviders = new Map(
    accounts.map((account) => [
      account.providerId as OAuthProviderId,
      account.createdAt,
    ]),
  );

  const linkedCount = accounts.length;
  const hasFallbackMethod = Boolean(credentialAccount) || hasMagicLinkProvider();

  return {
    hasPassword: Boolean(credentialAccount),
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
  userId: string;
  provider: OAuthProviderId;
};

export async function unlinkOAuthAccountForUser(
  params: UnlinkOAuthAccountParams,
) {
  const [linkedAccounts, credentialAccount] = await Promise.all([
    db.account.findMany({
      where: {
        userId: params.userId,
        providerId: { in: ALL_OAUTH_PROVIDER_IDS },
      },
      select: {
        id: true,
        providerId: true,
      },
    }),
    db.account.findFirst({
      where: { userId: params.userId, providerId: "credential" },
      select: { id: true },
    }),
  ]);

  const targetAccount = linkedAccounts.find(
    (account) => account.providerId === params.provider,
  );

  if (!targetAccount) {
    return { status: "not-found" as const };
  }

  // Block unlink if this is the last linked account — prevents lockout
  const hasFallbackMethod = Boolean(credentialAccount) || hasMagicLinkProvider();

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
