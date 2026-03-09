'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getPostSignInCallbackUrl } from '@/features/auth/lib/post-sign-in';

type MagicLinkFormProps = {
  email: string;
  redirect?: string | null;
  priceId?: string | null;
  inviteId?: string | null;
};

export function MagicLinkForm({ email, redirect, priceId, inviteId }: MagicLinkFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleMagicLink() {
    if (!email) {
      setError('Enter your email first.');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await signIn('resend', {
        email,
        redirect: false,
        redirectTo: getPostSignInCallbackUrl({ redirect, priceId, inviteId })
      });

      if (result?.error) {
        setError('Unable to send the sign-in link. Please try again.');
        return;
      }

      router.push(`/check-email?email=${encodeURIComponent(email)}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full"
        onClick={handleMagicLink}
        disabled={isPending}
      >
        {isPending ? (
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
