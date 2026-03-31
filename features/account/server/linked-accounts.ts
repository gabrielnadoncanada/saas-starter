import { headers } from "next/headers";
import {
  isOAuthProviderId,
} from "@/shared/lib/auth/oauth-config";

import { auth } from "@/shared/lib/auth/auth-config";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

type UserAccount = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

async function listCurrentUserAccounts() {
  return auth.api.listUserAccounts({
    headers: await headers(),
  });
}

function normalizeLinkedAt(value: UserAccount["createdAt"] | null | undefined) {
  if (!value) return null;

  const linkedAt = value instanceof Date ? value : new Date(value);
  return Number.isNaN(linkedAt.getTime()) ? null : linkedAt;
}

export async function getLinkedAccountsOverview(
  oauthProviders: OAuthProviderId[],
) {
  const accounts = await listCurrentUserAccounts();

  const linkedProviders = new Map(
    accounts
      .filter((account) => isOAuthProviderId(account.providerId))
      .map((account) => [account.providerId, normalizeLinkedAt(account.createdAt)]),
  );

  const linkedCount = accounts.length;
  const hasPassword = accounts.some((account) => account.providerId === "credential");

  return {
    hasPassword,
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
  provider: OAuthProviderId;
};

export async function unlinkOAuthAccountForUser(
  params: UnlinkOAuthAccountParams,
) {
  const linkedAccounts = await listCurrentUserAccounts();

  const targetAccount = linkedAccounts.find(
    (account) => account.providerId === params.provider,
  );

  if (!targetAccount) {
    return { status: "not-found" as const };
  }

  if (linkedAccounts.length <= 1) {
    return { status: "blocked" as const };
  }

  await auth.api.unlinkAccount({
    headers: await headers(),
    body: {
      providerId: params.provider,
    },
  });

  return { status: "unlinked" as const };
}
