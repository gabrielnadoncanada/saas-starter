import { redirect } from 'next/navigation';

import { SecuritySettingsClient } from '@/features/auth/components/SecuritySettingsClient';
import { getCurrentUser } from '@/features/auth/lib/current-user';
import { getLinkedAccountsOverview } from '@/features/auth/lib/linked-accounts';
import { getEnabledOAuthProviderIds, OAUTH_PROVIDER_LABELS } from '@/lib/auth/providers';

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type SecuritySettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function SecuritySettingsPage({
  searchParams
}: SecuritySettingsPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect('/sign-in');
  }

  const oauthProviders = getEnabledOAuthProviderIds();
  const linkedAccounts = await getLinkedAccountsOverview(user.id, oauthProviders);
  const success = getSingleSearchParam(params.success);
  const provider = getSingleSearchParam(params.provider);
  const providerLabel =
    provider && provider in OAUTH_PROVIDER_LABELS
      ? OAUTH_PROVIDER_LABELS[provider as keyof typeof OAUTH_PROVIDER_LABELS]
      : 'Provider';

  return (
    <SecuritySettingsClient
      providers={linkedAccounts.providers.map((linkedProvider) => ({
        ...linkedProvider,
        linkedAt: linkedProvider.linkedAt?.toISOString() ?? null,
        linkedAtLabel: linkedProvider.linkedAt
          ? linkedProvider.linkedAt.toISOString().slice(0, 10)
          : null
      }))}
      feedback={{
        success: success === 'linked' ? `${providerLabel} linked successfully.` : undefined
      }}
    />
  );
}
