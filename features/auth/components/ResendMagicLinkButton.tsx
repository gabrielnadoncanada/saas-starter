'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getPostSignInCallbackUrl } from '@/features/auth/utils/post-sign-in';
import type { AuthRedirect } from '@/features/auth/utils/auth-flow';

type ResendMagicLinkButtonProps = {
  email: string;
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function ResendMagicLinkButton({
  email,
  redirect,
  priceId,
  pricingModel,
  inviteId
}: ResendMagicLinkButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleResend() {
    try {
      setIsPending(true);

      const result = await signIn('resend', {
        email: email.trim().toLowerCase(),
        redirect: false,
        redirectTo: getPostSignInCallbackUrl({
          redirect,
          priceId,
          pricingModel,
          inviteId
        })
      });

      if (result?.error) {
        throw new Error('Unable to send a new sign-in link. Please try again.');
      }

      toast.success('A new sign-in link has been sent.');
    } catch {
      toast.error('Unable to send a new sign-in link. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className="font-medium underline underline-offset-4 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => void handleResend()}
      disabled={isPending}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </span>
      ) : (
        'Resend a new one'
      )}
    </button>
  );
}
