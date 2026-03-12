'use client';

import { useActionState, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAccountAction } from '@/features/auth/actions/delete-account.action';
import { routes } from '@/constants/routes';
import { DELETE_CONFIRMATION_WORD } from '@/features/auth/schemas/account.schema';
import type { DeleteAccountActionState } from '@/features/auth/types/auth.types';

export function DeleteAccountCard() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteAccountActionState,
    FormData
  >(deleteAccountAction, {});

  const isConfirmed = confirmation === DELETE_CONFIRMATION_WORD;

  useEffect(() => {
    if (!deleteState.success) {
      return;
    }

    void signOut({ redirectTo: routes.auth.login });
  }, [deleteState.success]);

  if (!showConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            Account deletion is permanent and cannot be undone.
          </p>

          <Button
            type="button"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setShowConfirmation(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Confirm Account Deletion</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={deleteAction} className="space-y-4">
          <p className="text-sm text-gray-500">
            This will permanently delete your account, data, and team memberships.
          </p>

          <div>
            <Label htmlFor="confirmation" className="text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold">{DELETE_CONFIRMATION_WORD}</span> to
              confirm
            </Label>

            <Input
              id="confirmation"
              name="confirmation"
              className="mt-2"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </div>

          {deleteState.error ? <p className="text-sm text-red-500">{deleteState.error}</p> : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setConfirmation('');
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={!isConfirmed || isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Permanently Delete'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}