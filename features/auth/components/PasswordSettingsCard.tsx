'use client';

import { useActionState } from 'react';
import { Loader2, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePasswordAction } from '@/features/auth/actions/update-password.action';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

export function PasswordSettingsCard() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePasswordAction, {});

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={passwordAction}>
          <div>
            <Label htmlFor="current-password" className="mb-2">
              Current Password
            </Label>
            <Input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={100}
              defaultValue={passwordState.currentPassword}
            />
          </div>
          <div>
            <Label htmlFor="new-password" className="mb-2">
              New Password
            </Label>
            <Input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={100}
              defaultValue={passwordState.newPassword}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="mb-2">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={100}
              defaultValue={passwordState.confirmPassword}
            />
          </div>
          {passwordState.error ? (
            <p className="text-sm text-red-500">{passwordState.error}</p>
          ) : null}
          {passwordState.success ? (
            <p className="text-sm text-green-500">{passwordState.success}</p>
          ) : null}
          <Button
            type="submit"
            className="bg-orange-500 text-white hover:bg-orange-600"
            disabled={isPasswordPending}
          >
            {isPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
