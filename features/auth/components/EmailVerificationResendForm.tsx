'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { requestEmailVerificationAction } from '@/features/auth/actions/request-email-verification.action';
import type { ActionState } from '@/lib/auth/middleware';

type EmailVerificationResendFormProps = {
  email: string;
  redirect?: string;
  priceId?: string;
};

export function EmailVerificationResendForm({
  email,
  redirect,
  priceId
}: EmailVerificationResendFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestEmailVerificationAction,
    { error: '', success: '' }
  );

  return (
    <form className="mt-6 space-y-4" action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="redirect" value={redirect ?? ''} />
      <input type="hidden" name="priceId" value={priceId ?? ''} />

      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <Button type="submit" variant="outline" className="w-full rounded-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Resend verification email'
        )}
      </Button>
    </form>
  );
}
