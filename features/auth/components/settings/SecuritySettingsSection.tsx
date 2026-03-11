import { redirect } from 'next/navigation';

import { SecuritySettingsPanel } from '@/features/auth/components/settings/SecuritySettingsPanel';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getLinkedAccountsOverview } from '@/features/auth/server/linked-accounts';
import type { LinkedProviderOverview } from '@/features/auth/types/auth.types';
import { getEnabledOAuthProviderIds, OAUTH_PROVIDER_LABELS } from '@/lib/auth/providers';

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type SecuritySettingsSectionProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function mapLinkedProviders(
  providers: Array<{
    provider: LinkedProviderOverview['provider'];
    linkedAt: Date | null;
    isLinked: boolean;
    canUnlink: boolean;
  }>
): LinkedProviderOverview[] {
  return providers.map((provider) => ({
    provider: provider.provider,
    linkedAt: provider.linkedAt?.toISOString() ?? null,
    linkedAtLabel: provider.linkedAt ? provider.linkedAt.toISOString().slice(0, 10) : null,
    isLinked: provider.isLinked,
    canUnlink: provider.canUnlink
  }));
}

export async function SecuritySettingsSection({
  searchParams = {}
}: SecuritySettingsSectionProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const oauthProviders = getEnabledOAuthProviderIds();
  const linkedAccounts = await getLinkedAccountsOverview(user.id, oauthProviders);

  const success = getSingleSearchParam(searchParams.success);
  const provider = getSingleSearchParam(searchParams.provider);

  const providerLabel =
    provider && provider in OAUTH_PROVIDER_LABELS
      ? OAUTH_PROVIDER_LABELS[provider as keyof typeof OAUTH_PROVIDER_LABELS]
      : 'Provider';

  return (
    <SecuritySettingsPanel
      providers={mapLinkedProviders(linkedAccounts.providers)}
      feedback={{
        success: success === 'linked' ? `${providerLabel} linked successfully.` : undefined
      }}
    />
  );
}
