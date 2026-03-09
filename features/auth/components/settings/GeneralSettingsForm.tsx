'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAccountAction } from '@/features/auth/actions/update-account.action';
import type {
  GeneralSettingsInitialValues,
  UpdateAccountActionState
} from '@/features/auth/types/auth.types';

type GeneralSettingsFormProps = {
  initialValues: GeneralSettingsInitialValues;
};

export function GeneralSettingsForm({ initialValues }: GeneralSettingsFormProps) {
  const [state, formAction, isPending] = useActionState<UpdateAccountActionState, FormData>(
    updateAccountAction,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" action={formAction}>
          <div>
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>

            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              defaultValue={state.name || initialValues.name}
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              defaultValue={initialValues.email}
              required
            />
          </div>

          {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-green-500">{state.success}</p> : null}

          <Button
            type="submit"
            className="bg-orange-500 text-white hover:bg-orange-600"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}