'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { MagicLinkForm } from '@/features/auth/components/MagicLinkForm';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { AuthModeLink } from '@/features/auth/components/AuthModeLink';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import {
  buildAlternateAuthHref,
  getAuthFlowParams,
  getAuthSubtitle
} from '@/features/auth/utils/auth-flow';
import { getPostSignInCallbackUrl } from '@/features/auth/utils/post-sign-in';
import type { AuthMode } from '@/features/auth/types/auth.types';
import type { OAuthProviderId } from '@/shared/lib/auth/providers';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'Unable to sign in with this provider. Try a different sign-in method.',
  OAuthSignin: 'Unable to sign in. Please try again.'
};

type AuthFormProps = {
  mode?: AuthMode;
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
};

export function AuthForm({
  mode = 'signin',
  oauthProviders = [],
  allowMagicLink = false
}: AuthFormProps) {
  const searchParams = useSearchParams();
  const { redirect, priceId, inviteId, error } = getAuthFlowParams(searchParams);

  const [email, setEmail] = useState('');
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);

  const callbackUrl = getPostSignInCallbackUrl({
    redirect,
    priceId,
    inviteId
  });

  const alternateAuthHref = buildAlternateAuthHref({
    mode,
    redirect,
    priceId,
    inviteId
  });

  const subtitle = getAuthSubtitle({
    allowMagicLink,
    hasOAuthProviders: oauthProviders.length > 0
  });

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    try {
      setPendingProvider(provider);

      await signIn(provider, {
        redirectTo: callbackUrl
      });
    } finally {
      setPendingProvider(null);
    }
  }

  const oauthErrorMessage = error ? OAUTH_ERROR_MESSAGES[error] : null;

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <AuthHeader mode={mode} subtitle={subtitle} />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              className="rounded-full border-gray-300 px-4 py-2"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {allowMagicLink ? (
              <MagicLinkForm
                email={email.trim()}
                redirect={redirect}
                priceId={priceId}
                inviteId={inviteId}
              />
            ) : null}
          </div>

          {oauthErrorMessage ? (
            <p className="text-sm text-red-500">{oauthErrorMessage}</p>
          ) : null}

          <OAuthButtons
            providers={oauthProviders}
            pendingProvider={pendingProvider}
            onProviderClick={(provider) => void handleOAuthSignIn(provider)}
          />

          <AuthModeLink mode={mode} href={alternateAuthHref} />
        </div>
      </div>
    </div>
  );
}