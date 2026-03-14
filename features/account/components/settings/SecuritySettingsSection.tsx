import { redirect } from 'next/navigation';

import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
  OAUTH_PROVIDER_LABELS
} from '@/shared/lib/auth/providers';
import { SecuritySettingsPanel } from '@/features/account/components/settings/SecuritySettingsPanel';
import { getLinkedAccountsOverview } from '@/features/account/server/linked-accounts';
import type { LinkedProviderOverview } from '@/features/account/types/account.types';

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
    redirect(routes.auth.login);
  }

  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const linkedAccounts = await getLinkedAccountsOverview(user.id, oauthProviders);

  const success = getSingleSearchParam(searchParams.success);
  const provider = getSingleSearchParam(searchParams.provider);

  const providerLabel =
    provider && provider in OAUTH_PROVIDER_LABELS
      ? OAUTH_PROVIDER_LABELS[provider as keyof typeof OAUTH_PROVIDER_LABELS]
      : 'Provider';

  return (
    <SecuritySettingsPanel
      allowMagicLink={allowMagicLink}
      providers={mapLinkedProviders(linkedAccounts.providers)}
      feedback={{
        success: success === 'linked' ? `${providerLabel} linked successfully.` : undefined
      }}
    />
  );
}
