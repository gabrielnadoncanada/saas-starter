'use client';

import { useActionState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAccountAction } from '@/features/auth/actions/delete-account.action';

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export function DeleteAccountCard() {
  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccountAction, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-500">
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
          {deleteState.error ? <p className="text-sm text-red-500">{deleteState.error}</p> : null}
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
  );
}
