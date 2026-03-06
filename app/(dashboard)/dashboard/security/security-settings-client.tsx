'use client';

import { useActionState } from 'react';
import { signIn as signInWithProvider } from 'next-auth/react';
import { unlinkAuthProvider, updatePassword, deleteAccount } from '@/app/(login)/actions';
import { OAUTH_PROVIDER_LABELS, type OAuthProviderId } from '@/lib/auth/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  Link2,
  Loader2,
  Lock,
  ShieldAlert,
  Trash2,
  Unlink2
} from 'lucide-react';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

type LinkedAccountsState = {
  provider?: string;
  error?: string;
  success?: string;
};

type LinkedProvider = {
  provider: OAuthProviderId;
  linkedAt: string | null;
  linkedAtLabel: string | null;
  isLinked: boolean;
  canUnlink: boolean;
};

export function SecuritySettingsClient({
  hasPassword,
  providers,
  feedback
}: {
  hasPassword: boolean;
  providers: LinkedProvider[];
  feedback?: {
    error?: string;
    success?: string;
  };
}) {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  const [linkedAccountsState, unlinkAction, isUnlinkPending] = useActionState<
    LinkedAccountsState,
    FormData
  >(unlinkAuthProvider, {});

  const statusMessage =
    linkedAccountsState.error ||
    linkedAccountsState.success ||
    feedback?.error ||
    feedback?.success ||
    '';

  const statusIsError = Boolean(
    linkedAccountsState.error || feedback?.error
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Security Settings
      </h1>
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
            {passwordState.error && (
              <p className="text-red-500 text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-500 text-sm">{passwordState.success}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-500">
                {hasPassword
                  ? 'Available as a sign-in method.'
                  : 'Not available as a sign-in method.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {hasPassword ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Active
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Not linked
                </>
              )}
            </div>
          </div>

          {providers.map((provider) => (
            <div
              key={provider.provider}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {OAUTH_PROVIDER_LABELS[provider.provider]}
                </p>
                <p className="text-sm text-gray-500">
                  {provider.isLinked && provider.linkedAtLabel
                    ? `Linked on ${provider.linkedAtLabel}`
                    : 'Not linked'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    provider.isLinked ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {provider.isLinked ? 'Linked' : 'Not linked'}
                </span>
                {provider.isLinked ? (
                  <form
                    action={unlinkAction}
                    onSubmit={(event) => {
                      if (
                        !window.confirm(
                          `Unlink ${OAUTH_PROVIDER_LABELS[provider.provider]} from your account?`
                        )
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="provider" value={provider.provider} />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isUnlinkPending || !provider.canUnlink}
                    >
                      {isUnlinkPending &&
                      linkedAccountsState.provider === provider.provider ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unlinking...
                        </>
                      ) : (
                        <>
                          <Unlink2 className="mr-2 h-4 w-4" />
                          Unlink
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      signInWithProvider(provider.provider, {
                        callbackUrl: `/dashboard/security?success=linked&provider=${provider.provider}`
                      })
                    }
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Link
                  </Button>
                )}
              </div>
            </div>
          ))}

          {statusMessage ? (
            <p className={statusIsError ? 'text-red-500 text-sm' : 'text-green-600 text-sm'}>
              {statusMessage}
            </p>
          ) : null}
          <p className="text-sm text-gray-500">
            You cannot unlink your last remaining sign-in method.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Account deletion is non-reversable. Please proceed with caution.
          </p>
          <form action={deleteAction} className="space-y-4">
            <div>
              <Label htmlFor="delete-password" className="mb-2">
                Confirm Password
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
              />
            </div>
            {deleteState.error && (
              <p className="text-red-500 text-sm">{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
