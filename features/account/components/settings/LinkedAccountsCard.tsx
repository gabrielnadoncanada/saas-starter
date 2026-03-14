'use client';

import { format, parseISO } from 'date-fns';
import { signIn } from 'next-auth/react';
import { useActionState, useState } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from '@/shared/components/ui/item';
import { unlinkAuthProviderAction } from '@/features/account/actions/unlink-auth-provider.action';
import type {
  LinkedAccountsActionState,
  LinkedProviderOverview,
  SecuritySettingsFeedback
} from '@/features/account/types/account.types';
import { routes } from '@/shared/constants/routes';
import { OAUTH_PROVIDER_LABELS } from '@/shared/lib/auth/providers';
import { getFieldState } from '@/shared/lib/get-field-state';

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
  const [linkingProvider, setLinkingProvider] = useState<LinkedProviderOverview['provider'] | null>(
    null
  );
  const [state, formAction, isPending] = useActionState<LinkedAccountsActionState, FormData>(
    unlinkAuthProviderAction,
    {}
  );
  const selectedProvider = state.values?.provider;
  const providerField = getFieldState(state, 'provider');

  async function handleLinkAccount(provider: LinkedProviderOverview['provider']) {
    setLinkingProvider(provider);

    await signIn(provider, {
      redirectTo: `${routes.app.settingsAuthentication}?provider=${provider}&success=linked`
    });

    setLinkingProvider(null);
  }

  return (
    <>
      <ItemGroup className="gap-4">
        {providers.map((provider) => {
          const isUnlinkingProvider = selectedProvider === provider.provider && isPending;
          const isLinkingProvider = linkingProvider === provider.provider;

          return (
            <Item key={provider.provider} variant="outline">
              <ItemContent>
                <ItemTitle>
                  {OAUTH_PROVIDER_LABELS[provider.provider]}
                  {provider.isLinked ? <Badge variant="secondary">Linked</Badge> : null}
                </ItemTitle>
                <ItemDescription>
                  {provider.linkedAt
                    ? `Linked on ${format(parseISO(provider.linkedAt), 'PP')}`
                    : 'Not linked yet'}
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                {provider.isLinked ? (
                  provider.canUnlink ? (
                    <form action={formAction}>
                      <input type="hidden" name="provider" value={provider.provider} />
                      <Button type="submit" variant="outline" disabled={isUnlinkingProvider}>
                        {isUnlinkingProvider ? 'Unlinking...' : 'Unlink'}
                      </Button>
                    </form>
                  ) : (
                    <Badge>Required</Badge>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLinkingProvider}
                    onClick={() => void handleLinkAccount(provider.provider)}
                  >
                    {isLinkingProvider ? 'Redirecting...' : 'Link'}
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>

      <Field data-invalid={providerField.invalid} className="gap-1">
        <FieldLabel className="sr-only" htmlFor="linked-account-provider">
          Provider
        </FieldLabel>
        <input
          id="linked-account-provider"
          type="hidden"
          name="provider"
          value={selectedProvider ?? ''}
          readOnly
        />
        <FieldError>{providerField.error}</FieldError>
      </Field>

      {
        state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null
      }

      {
        feedback?.error ? (
          <Alert variant="destructive">
            <AlertDescription>{feedback.error}</AlertDescription>
          </Alert>
        ) : null
      }

      {
        feedback?.success ? (
          <Alert>
            <AlertDescription>{feedback.success}</AlertDescription>
          </Alert>
        ) : null
      }
    </>
  );
}
