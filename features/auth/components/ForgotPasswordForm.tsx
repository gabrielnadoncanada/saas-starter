'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordResetAction } from '@/features/auth/actions/request-password-reset.action';
import { ActionState } from '@/lib/auth/middleware';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    { error: '', success: '' }
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Reset your password</h1>
            <p className="text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a reset link.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={255}
                className="mt-2 rounded-full border-gray-300 px-4 py-2"
                placeholder="Enter your email"
              />
            </div>

            {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
            {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-orange-600 text-white hover:bg-orange-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/sign-in" className="font-medium text-orange-600 hover:text-orange-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
