import { ActivityType } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import type { OAuthProviderId } from "@/lib/auth/providers";
import { createAuthActivityForUser } from "@/lib/auth/activity";

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

  return {
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;
      const isLinked = linkedAt !== null;

      return {
        provider,
        linkedAt,
        isLinked,
        canUnlink: isLinked && linkedCount > 1,
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
      provider: { not: "resend" },
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

  if (linkedAccounts.length <= 1) {
    return { status: "blocked" as const };
  }

  await db.account.delete({
    where: { id: targetAccount.id },
  });

  await createAuthActivityForUser(
    params.userId,
    ActivityType.UNLINK_AUTH_PROVIDER,
  );

  return { status: "unlinked" as const };
}
