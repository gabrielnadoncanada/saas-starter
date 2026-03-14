'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
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
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={initialValues.image ?? undefined} alt={initialValues.name} />
            <AvatarFallback className="text-lg justify-center">
              {(initialValues.name || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{initialValues.name}</p>
            <p className="text-xs text-muted-foreground">{initialValues.email}</p>
          </div>
        </div>

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
            <Label htmlFor="phoneNumber" className="mb-2">
              Phone number
            </Label>

            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              defaultValue={state.phoneNumber ?? initialValues.phoneNumber}
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
