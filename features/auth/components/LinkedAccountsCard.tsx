'use client';

import { useActionState } from 'react';
import { signIn as signInWithProvider } from 'next-auth/react';
import {
  CheckCircle2,
  Link2,
  Loader2,
  ShieldAlert,
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
  hasPassword: boolean;
  providers: LinkedProvider[];
  feedback?: {
    error?: string;
    success?: string;
  };
};

export function LinkedAccountsCard({
  hasPassword,
  providers,
  feedback
}: LinkedAccountsCardProps) {
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
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-900">Password</p>
            <p className="text-sm text-gray-500">
              {hasPassword
                ? 'Available as a sign-in method.'
                : 'Not available as a sign-in method.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            {hasPassword ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Active
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Not linked
              </>
            )}
          </div>
        </div>

        {providers.map((provider) => (
          <div
            key={provider.provider}
            className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">
                {OAUTH_PROVIDER_LABELS[provider.provider]}
              </p>
              <p className="text-sm text-gray-500">
                {provider.isLinked && provider.linkedAtLabel
                  ? `Linked on ${provider.linkedAtLabel}`
                  : 'Not linked'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${
                  provider.isLinked ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {provider.isLinked ? 'Linked' : 'Not linked'}
              </span>
              {provider.isLinked ? (
                <form
                  action={unlinkAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Unlink ${OAUTH_PROVIDER_LABELS[provider.provider]} from your account?`
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="provider" value={provider.provider} />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isUnlinkPending || !provider.canUnlink}
                  >
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
                      callbackUrl: `/dashboard/security?success=linked&provider=${provider.provider}`
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
        <p className="text-sm text-gray-500">
          You cannot unlink your last remaining sign-in method.
        </p>
      </CardContent>
    </Card>
  );
}
