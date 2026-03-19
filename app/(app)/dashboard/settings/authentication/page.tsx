import { redirect } from 'next/navigation';

import { PasswordSettingsCard } from '@/features/auth/components/PasswordSettingsCard';
import { LinkedAccountsCard } from '@/features/account/components/settings/LinkedAccountsCard';
import { getLinkedAccountsOverview } from '@/features/account/server/linked-accounts';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';
import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import {
  OAUTH_PROVIDER_LABELS,
  getEnabledOAuthProviderIds
} from '@/shared/lib/auth/oauth-config';
import { hasMagicLinkProvider } from '@/shared/lib/auth/providers';
import { ContentSection } from '@/features/account/components/settings/ContentSection';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'Unable to link this provider. Try a different sign-in method.',
  OAuthSignin: 'Unable to start provider linking. Please try again.'
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

  const resolvedSearchParams = await searchParams;
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const linkedAccounts = await getLinkedAccountsOverview(user.id, oauthProviders);

  const success = getSingleSearchParam(resolvedSearchParams.success);
  const provider = getSingleSearchParam(resolvedSearchParams.provider);
  const error = getSingleSearchParam(resolvedSearchParams.error);

  const providerLabel =
    provider && provider in OAUTH_PROVIDER_LABELS
      ? OAUTH_PROVIDER_LABELS[provider as keyof typeof OAUTH_PROVIDER_LABELS]
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
          <PasswordSettingsCard hasPassword={Boolean(user.passwordHash)} />
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
