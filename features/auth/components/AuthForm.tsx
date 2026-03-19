'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/shared/components/ui/input';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { buildCheckEmailHref, getAuthFlowParams } from '@/features/auth/utils/auth-flow';
import { getPostSignInCallbackUrl } from '@/features/auth/utils/post-sign-in';
import { Button } from '@/shared/components/ui/button';
import { routes } from '@/shared/constants/routes';
import { useToastMessage } from '@/shared/hooks/useToastMessage';
import type { OAuthProviderId } from '@/shared/lib/auth/oauth-config';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'Unable to sign in with this provider. Try a different sign-in method.',
  OAuthSignin: 'Unable to sign in. Please try again.'
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

type AuthFormProps = {
  oauthProviders?: OAuthProviderId[];
  allowMagicLink?: boolean;
};

export function AuthForm({
  oauthProviders = [],
  allowMagicLink = false
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirect, priceId, pricingModel, inviteId, error } = getAuthFlowParams(searchParams);

  const [email, setEmail] = useState('');
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const [emailError, setEmailError] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  const callbackUrl = getPostSignInCallbackUrl({
    redirect,
    priceId,
    pricingModel,
    inviteId
  });
  const oauthErrorMessage = error
    ? OAUTH_ERROR_MESSAGES[error] ?? 'Unable to sign in. Please try again.'
    : null;

  useToastMessage(oauthErrorMessage, {
    kind: 'error',
    trigger: error
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

  async function handleMagicLink() {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setEmailError('Enter your email first.');
      return;
    }

    try {
      setEmailError('');
      setIsSendingMagicLink(true);

      const result = await signIn('resend', {
        email: normalizedEmail,
        redirect: false,
        redirectTo: callbackUrl
      });

      if (result?.error) {
        throw new Error('Unable to send the sign-in link. Please try again.');
      }

      router.push(buildCheckEmailHref(routes.auth.checkEmail, {
        email: normalizedEmail,
        redirect,
        priceId,
        pricingModel,
        inviteId
      }));
    } catch {
      toast.error('Unable to send the sign-in link. Please try again.');
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  return (
    <>
      {allowMagicLink ? (
        <div className="space-y-3">
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              aria-invalid={Boolean(emailError)}
              onChange={(event) => {
                setEmail(event.target.value);

                if (emailError) {
                  setEmailError('');
                }
              }}
            />
            <FieldError>{emailError}</FieldError>
          </Field>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full "
              onClick={() => void handleMagicLink()}
              disabled={isSendingMagicLink}
            >
              {isSendingMagicLink ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email Link
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground text-uppercase">Or continue with</span>
        </div>
      </div>
      <OAuthButtons
        providers={oauthProviders}
        pendingProvider={pendingProvider}
        onProviderClick={(provider) => void handleOAuthSignIn(provider)}
      />
    </>
  );
}
