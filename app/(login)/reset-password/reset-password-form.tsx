'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '../actions';
import { ActionState } from '@/lib/auth/middleware';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Choose a new password</h1>
            <p className="text-sm text-gray-600">
              Your new password must be at least 8 characters long.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-6">
            <input type="hidden" name="token" value={token} />

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                New password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                className="mt-2 rounded-full border-gray-300 px-4 py-2"
                placeholder="Enter your new password"
              />
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                className="mt-2 rounded-full border-gray-300 px-4 py-2"
                placeholder="Confirm your new password"
              />
            </div>

            {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}

            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-orange-600 text-white hover:bg-orange-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Reset password'
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
