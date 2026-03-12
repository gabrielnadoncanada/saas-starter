'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { CircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { routes } from '@/constants/routes';
import { MagicLinkForm } from '@/features/auth/components/login/MagicLinkForm';
import { getPostSignInCallbackUrl } from '@/features/auth/utils/post-sign-in';
import type { OAuthProviderId } from '@/lib/auth/providers';

const OAUTH_PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: 'Continue with Google',
  github: 'Continue with GitHub'
};

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'Unable to sign in with this provider. Try a different sign-in method.',
  OAuthSignin: 'Unable to sign in. Please try again.'
};

type LoginFormProps = {
  mode?: 'signin' | 'signup';
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
};

function buildAlternateAuthHref(params: {
  mode: 'signin' | 'signup';
  redirect: string | null;
  priceId: string | null;
  inviteId: string | null;
}) {
  const pathname = params.mode === 'signin' ? routes.auth.signup : routes.auth.login;
  const query = new URLSearchParams();

  if (params.redirect) {
    query.set('redirect', params.redirect);
  }

  if (params.priceId) {
    query.set('priceId', params.priceId);
  }

  if (params.inviteId) {
    query.set('inviteId', params.inviteId);
  }

  const queryString = query.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function LoginForm({
  mode = 'signin',
  oauthProviders = [],
  allowMagicLink = false
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');

  const callbackUrl = useMemo(
    () => getPostSignInCallbackUrl({ redirect, priceId, inviteId }),
    [redirect, priceId, inviteId]
  );

  const alternateAuthHref = useMemo(
    () =>
      buildAlternateAuthHref({
        mode,
        redirect,
        priceId,
        inviteId
      }),
    [mode, redirect, priceId, inviteId]
  );

  async function handleOAuthSignIn(provider: OAuthProviderId) {
    await signIn(provider, { redirectTo: callbackUrl });
    router.refresh();
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </h2>

        <p className="mt-3 text-center text-sm text-gray-600">
          Use a magic link or one of your social providers to continue.
        </p>
      </div>

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
              onChange={(event) => setEmail(event.target.value.trim())}
            />

            {allowMagicLink ? (
              <MagicLinkForm
                email={email}
                redirect={redirect}
                priceId={priceId}
                inviteId={inviteId}
              />
            ) : null}
          </div>

          {error && OAUTH_ERROR_MESSAGES[error] ? (
            <p className="text-sm text-red-500">{OAUTH_ERROR_MESSAGES[error]}</p>
          ) : null}

          {oauthProviders.length > 0 ? (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>

                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {oauthProviders.map((provider) => (
                <Button
                  key={provider}
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => void handleOAuthSignIn(provider)}
                >
                  {OAUTH_PROVIDER_LABELS[provider]}
                </Button>
              ))}
            </div>
          ) : null}

          <Link
            href={alternateAuthHref}
            className="flex w-full justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
          </Link>
        </div>
      </div>
    </div>
  );
}