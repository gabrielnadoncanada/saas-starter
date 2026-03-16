'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { routes } from '@/shared/constants/routes';
import type { AuthRedirect } from '@/features/auth/utils/auth-flow';
import { getPostSignInCallbackUrl } from '@/features/auth/utils/post-sign-in';

type MagicLinkFormProps = {
  email: string;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  inviteId?: string | null;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function buildCheckEmailHref(email: string): string {
  return `${routes.auth.checkEmail}?email=${encodeURIComponent(email)}`;
}

export function MagicLinkForm({
  email,
  redirect,
  priceId,
  inviteId
}: MagicLinkFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleMagicLink() {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setError('Enter your email first.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);

      const result = await signIn('resend', {
        email: normalizedEmail,
        redirect: false,
        redirectTo: getPostSignInCallbackUrl({
          redirect,
          priceId,
          inviteId
        })
      });

      if (result?.error) {
        setError('Unable to send the sign-in link. Please try again.');
        return;
      }

      router.push(buildCheckEmailHref(normalizedEmail));
    } catch {
      setError('Unable to send the sign-in link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full"
        onClick={() => void handleMagicLink()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending link...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Continue with Email
          </>
        )}
      </Button>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
