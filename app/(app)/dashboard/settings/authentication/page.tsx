import { redirect } from 'next/navigation';

import { PasswordSettingsCard } from '@/features/auth/components/password/password-settings-card';
import { LinkedAccountsCard } from '@/features/account/components/settings/linked-accounts-card';
import { getLinkedAccountsOverview } from '@/features/account/server/linked-accounts';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import {
  OAUTH_PROVIDER_LABELS,
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
  isOAuthProviderId,
} from '@/shared/lib/auth/oauth-config';
import { ContentSection } from '@/features/account/components/settings/content-section';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'Unable to link this provider. Try a different sign-in method.',
  OAuthSignin: 'Unable to start provider linking. Please try again.'
};

type PageProps = {
  searchParams: Promise<{
    success?: string;
    provider?: string;
    error?: string;
  }>;
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
    isLinked: provider.isLinked,
    canUnlink: provider.canUnlink
  }));
}

export default async function AuthenticationPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  const { success, provider, error } = await searchParams;
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const linkedAccounts = await getLinkedAccountsOverview(oauthProviders);

  const providerLabel =
    provider && isOAuthProviderId(provider)
      ? OAUTH_PROVIDER_LABELS[provider]
      : 'Provider';
  const feedback: SecuritySettingsFeedback = {
    error: error ? OAUTH_ERROR_MESSAGES[error] ?? 'Unable to link this provider.' : undefined,
    success:
      success === 'linked'
        ? `${providerLabel} linked successfully.`
        : success === 'unlinked'
          ? `${providerLabel} unlinked successfully.`
          : undefined
  };

  return (
    <ContentSection
      title='Authentication Settings'
      desc='Manage your authentication settings and connect your accounts.'
    >
      <>
        <div className="mb-6">
          <PasswordSettingsCard hasPassword={linkedAccounts.hasPassword} />
        </div>

        <LinkedAccountsCard
          allowMagicLink={allowMagicLink}
          providers={mapLinkedProviders(linkedAccounts.providers)}
          feedback={feedback}
        />
      </>
    </ContentSection>
  );
}
