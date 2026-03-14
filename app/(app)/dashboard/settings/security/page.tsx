import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';

import { LinkedAccountsCard } from '@/features/account/components/settings/LinkedAccountsCard';
import {
  activityIconMap,
  emptyActivityIcon,
  formatActivityAction,
  getActivityLogs
} from '@/features/account/server/activity-log';
import { getLinkedAccountsOverview } from '@/features/account/server/linked-accounts';
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';
import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
  OAUTH_PROVIDER_LABELS
} from '@/shared/lib/auth/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

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

export default async function SecurityPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  const resolvedSearchParams = await searchParams;
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const [linkedAccounts, logs] = await Promise.all([
    getLinkedAccountsOverview(user.id, oauthProviders),
    getActivityLogs()
  ]);

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
  const EmptyActivityIcon = emptyActivityIcon;

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <SettingsPageHeader title="Security" />
      <LinkedAccountsCard
        allowMagicLink={allowMagicLink}
        providers={mapLinkedProviders(linkedAccounts.providers)}
        feedback={feedback}
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = activityIconMap[log.action] || emptyActivityIcon;

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {formatActivityAction(log.action)}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <EmptyActivityIcon className="mb-4 h-12 w-12 text-orange-500" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No activity yet</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                When you perform actions like signing in or updating your account,
                they&apos;ll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
