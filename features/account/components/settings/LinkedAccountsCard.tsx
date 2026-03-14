'use client';

import { useActionState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { unlinkAuthProviderAction } from '@/features/account/actions/unlink-auth-provider.action';
import type {
  LinkedAccountsActionState,
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';
import { OAUTH_PROVIDER_LABELS } from '@/shared/lib/auth/providers';

type LinkedAccountsCardProps = {
  allowMagicLink: boolean;
  providers: LinkedProviderOverview[];
  feedback?: SecuritySettingsFeedback;
};

export function LinkedAccountsCard({
  allowMagicLink,
  providers,
  feedback
}: LinkedAccountsCardProps) {
  const [state, formAction, isPending] = useActionState<LinkedAccountsActionState, FormData>(
    unlinkAuthProviderAction,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Sign-in Methods</CardTitle>
        <CardDescription>
          Manage the providers you use to access this account.
          {allowMagicLink ? ' Magic links are enabled.' : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const isCurrentAction = state.provider === provider.provider && isPending;

          return (
            <div
              key={provider.provider}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{OAUTH_PROVIDER_LABELS[provider.provider]}</p>
                  {provider.isLinked ? <Badge variant="secondary">Linked</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {provider.linkedAtLabel
                    ? `Linked on ${provider.linkedAtLabel}`
                    : 'Not linked yet'}
                </p>
              </div>

              {provider.isLinked ? (
                provider.canUnlink ? (
                  <form action={formAction}>
                    <input type="hidden" name="provider" value={provider.provider} />
                    <Button type="submit" variant="outline" disabled={isCurrentAction}>
                      {isCurrentAction ? 'Unlinking...' : 'Unlink'}
                    </Button>
                  </form>
                ) : (
                  <Badge>Required</Badge>
                )
              ) : null}
            </div>
          );
        })}

        {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
        {feedback?.success ? <p className="text-sm text-green-500">{feedback.success}</p> : null}
      </CardContent>
    </Card>
  );
}
