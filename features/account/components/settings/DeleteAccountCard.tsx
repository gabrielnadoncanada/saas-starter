'use client';

import { useActionState, useState } from 'react';

import { deleteAccountAction } from '@/features/account/actions/delete-account.action';
import { DELETE_CONFIRMATION_WORD } from '@/features/account/schemas/account.schema';
import type { DeleteAccountActionState } from '@/features/account/types/account.types';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { getFieldState } from '@/shared/lib/get-field-state';

export function DeleteAccountCard() {
  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<DeleteAccountActionState, FormData>(
    deleteAccountAction,
    {},
  );

  const confirmation = state.values?.confirmation ?? '';
  const confirmationField = getFieldState(state, 'confirmation');

  useFormActionToasts(state);

  return (
    <Card className="mt-6 border-destructive/30">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and remove access to your workspace.
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                Type {DELETE_CONFIRMATION_WORD} to confirm. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <form action={formAction} className="space-y-4">
              <Field data-invalid={confirmationField.invalid}>
                <FieldLabel htmlFor="confirmation">Confirmation</FieldLabel>
                <Input
                  id="confirmation"
                  name="confirmation"
                  placeholder={DELETE_CONFIRMATION_WORD}
                  autoComplete="off"
                  defaultValue={confirmation}
                  aria-invalid={confirmationField.invalid}
                />
                <FieldError>{confirmationField.error}</FieldError>
              </Field>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isPending}>
                  {isPending ? 'Deleting...' : 'Delete account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
