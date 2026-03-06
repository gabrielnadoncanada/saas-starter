import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getLinkedAccountsOverview } from '@/lib/auth/linked-accounts';
import { getEnabledOAuthProviderIds, OAUTH_PROVIDER_LABELS } from '@/lib/auth/providers';
import { SecuritySettingsClient } from './security-settings-client';

function getSingleSearchParam(
  value: string | string[] | undefined
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SecurityPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);

  if (!user) {
    redirect('/sign-in');
  }

  const oauthProviders = getEnabledOAuthProviderIds();
  const linkedAccounts = await getLinkedAccountsOverview(user.id, oauthProviders);
  const success = getSingleSearchParam(params.success);
  const error = getSingleSearchParam(params.error);
  const provider = getSingleSearchParam(params.provider);
  const providerLabel =
    provider && provider in OAUTH_PROVIDER_LABELS
      ? OAUTH_PROVIDER_LABELS[provider as keyof typeof OAUTH_PROVIDER_LABELS]
      : 'Provider';
  const errorMessage =
    error === 'ProviderAlreadyLinked'
      ? `${providerLabel} is already linked to another account.`
      : error === 'ProviderAlreadyOnAccount'
        ? `This account already has a linked ${providerLabel} sign-in.`
        : undefined;

  return (
    <SecuritySettingsClient
      hasPassword={linkedAccounts.hasPassword}
      providers={linkedAccounts.providers.map((linkedProvider) => ({
        ...linkedProvider,
        linkedAt: linkedProvider.linkedAt?.toISOString() ?? null,
        linkedAtLabel: linkedProvider.linkedAt
          ? linkedProvider.linkedAt.toISOString().slice(0, 10)
          : null
      }))}
      feedback={{
        success:
          success === 'linked'
            ? `${providerLabel} linked successfully.`
            : undefined,
        error: errorMessage
      }}
    />
  );
}
