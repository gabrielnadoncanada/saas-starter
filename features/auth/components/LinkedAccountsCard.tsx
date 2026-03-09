'use client';

import { useActionState } from 'react';
import { signIn as signInWithProvider } from 'next-auth/react';
import {
  CheckCircle2,
  Link2,
  Loader2,
  Mail,
  Unlink2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unlinkAuthProviderAction } from '@/features/auth/actions/unlink-auth-provider.action';
import { OAUTH_PROVIDER_LABELS, type OAuthProviderId } from '@/lib/auth/providers';

type LinkedAccountsState = {
  provider?: string;
  error?: string;
  success?: string;
};

export type LinkedProvider = {
  provider: OAuthProviderId;
  linkedAt: string | null;
  linkedAtLabel: string | null;
  isLinked: boolean;
  canUnlink: boolean;
};

type LinkedAccountsCardProps = {
  providers: LinkedProvider[];
  feedback?: {
    error?: string;
    success?: string;
  };
};

export function LinkedAccountsCard({ providers, feedback }: LinkedAccountsCardProps) {
  const [linkedAccountsState, unlinkAction, isUnlinkPending] = useActionState<
    LinkedAccountsState,
    FormData
  >(unlinkAuthProviderAction, {});

  const statusMessage =
    linkedAccountsState.error ||
    linkedAccountsState.success ||
    feedback?.error ||
    feedback?.success ||
    '';
  const statusIsError = Boolean(linkedAccountsState.error || feedback?.error);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="font-medium text-foreground">Magic Link</p>
            <p className="text-sm text-muted-foreground">Always available for your email.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Active
          </div>
        </div>

        {providers.map((provider) => (
          <div
            key={provider.provider}
            className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">
                {OAUTH_PROVIDER_LABELS[provider.provider]}
              </p>
              <p className="text-sm text-muted-foreground">
                {provider.isLinked && provider.linkedAtLabel
                  ? `Linked on ${provider.linkedAtLabel}`
                  : 'Not linked'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${
                  provider.isLinked ? 'text-green-700' : 'text-muted-foreground'
                }`}
              >
                {provider.isLinked ? 'Linked' : 'Not linked'}
              </span>
              {provider.isLinked ? (
                <form action={unlinkAction}>
                  <input type="hidden" name="provider" value={provider.provider} />
                  <Button type="submit" variant="outline" disabled={isUnlinkPending}>
                    {isUnlinkPending && linkedAccountsState.provider === provider.provider ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unlinking...
                      </>
                    ) : (
                      <>
                        <Unlink2 className="mr-2 h-4 w-4" />
                        Unlink
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    signInWithProvider(provider.provider, {
                      redirectTo: `/dashboard/security?success=linked&provider=${provider.provider}`
                    })
                  }
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </Button>
              )}
            </div>
          </div>
        ))}

        {statusMessage ? (
          <p className={statusIsError ? 'text-sm text-red-500' : 'text-sm text-green-600'}>
            {statusMessage}
          </p>
        ) : null}
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          You can always sign in with a magic link, even after unlinking OAuth providers.
        </p>
      </CardContent>
    </Card>
  );
}
