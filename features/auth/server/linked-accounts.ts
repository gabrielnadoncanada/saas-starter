import { ActivityType } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import type { OAuthProviderId } from "@/lib/auth/providers";

type LinkedAccountsDeps = {
  db: {
    account: Pick<typeof db.account, "findMany" | "findFirst" | "delete">;
    activityLog: Pick<typeof db.activityLog, "create">;
    teamMember: Pick<typeof db.teamMember, "findFirst">;
  };
};

const defaultDeps: LinkedAccountsDeps = { db };

export async function getLinkedAccountsOverview(
  userId: number,
  oauthProviders: OAuthProviderId[],
  deps = defaultDeps,
) {
  const accounts = await deps.db.account.findMany({
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
    accounts.map(
      (account) =>
        [account.provider as OAuthProviderId, account.createdAt] as const,
    ),
  );

  return {
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedProviders.get(provider) ?? null;

      return {
        provider,
        linkedAt,
        isLinked: linkedAt !== null,
        canUnlink: linkedAt !== null,
      };
    }),
  };
}

export async function unlinkOAuthAccountForUser(
  params: { userId: number; provider: OAuthProviderId },
  deps = defaultDeps,
) {
  const targetAccount = await deps.db.account.findFirst({
    where: {
      userId: params.userId,
      provider: params.provider,
    },
    select: { id: true },
  });

  if (!targetAccount) {
    return { status: "not-found" as const };
  }

  await deps.db.account.delete({
    where: { id: targetAccount.id },
  });

  const teamMember = await deps.db.teamMember.findFirst({
    where: { userId: params.userId },
    select: { teamId: true },
  });

  if (teamMember) {
    await deps.db.activityLog.create({
      data: {
        teamId: teamMember.teamId,
        userId: params.userId,
        action: ActivityType.UNLINK_AUTH_PROVIDER,
        ipAddress: "",
      },
    });
  }

  return { status: "unlinked" as const };
}
