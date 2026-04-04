import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import {
  isOAuthProviderId,
  type OAuthProviderId,
} from "@/shared/lib/auth/oauth-config";

export type LinkedProviderOverview = {
  provider: OAuthProviderId;
  linkedAt: string | null;
  isLinked: boolean;
  canUnlink: boolean;
};

type UserAccount = Awaited<
  ReturnType<typeof auth.api.listUserAccounts>
>[number];

async function listCurrentUserAccounts() {
  return auth.api.listUserAccounts({
    headers: await headers(),
  });
}

function parseLinkedAccountDate(
  value: UserAccount["createdAt"] | null | undefined,
) {
  if (!value) {
    return null;
  }

  const linkedAt = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(linkedAt.getTime())) {
    return null;
  }

  return linkedAt;
}

export async function getLinkedAccountsOverview(
  oauthProviders: OAuthProviderId[],
): Promise<{
  hasPassword: boolean;
  providers: LinkedProviderOverview[];
}> {
  const currentUserAccounts = await listCurrentUserAccounts();

  const linkedOAuthProviders = new Map(
    currentUserAccounts
      .filter((account) => isOAuthProviderId(account.providerId))
      .map((account) => [
        account.providerId,
        parseLinkedAccountDate(account.createdAt),
      ]),
  );

  const linkedAccountCount = currentUserAccounts.length;
  const hasPasswordAccount = currentUserAccounts.some(
    (account) => account.providerId === "credential",
  );

  return {
    hasPassword: hasPasswordAccount,
    providers: oauthProviders.map((provider) => {
      const linkedAt = linkedOAuthProviders.get(provider) ?? null;
      const isLinked = linkedAt !== null;

      return {
        provider,
        linkedAt: linkedAt?.toISOString() ?? null,
        isLinked,
        canUnlink: isLinked && linkedAccountCount > 1,
      };
    }),
  };
}

type UnlinkOAuthAccountParams = {
  provider: OAuthProviderId;
};

export async function unlinkOAuthAccountForUser({
  provider,
}: UnlinkOAuthAccountParams) {
  const currentUserAccounts = await listCurrentUserAccounts();

  const accountToUnlink = currentUserAccounts.find(
    (account) => account.providerId === provider,
  );

  if (!accountToUnlink) {
    return { status: "not-found" as const };
  }

  if (currentUserAccounts.length <= 1) {
    return { status: "blocked" as const };
  }

  await auth.api.unlinkAccount({
    headers: await headers(),
    body: {
      providerId: provider,
    },
  });

  return { status: "unlinked" as const };
}
