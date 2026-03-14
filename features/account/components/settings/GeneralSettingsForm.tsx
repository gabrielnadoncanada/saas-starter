'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { updateAccountAction } from '@/features/account/actions/update-account.action';
import type {
  GeneralSettingsInitialValues,
  UpdateAccountActionState,
} from '@/features/account/types/account.types';
import { getFieldState } from '@/shared/lib/get-field-state';
import { useToastMessage } from '@/shared/hooks/useToastMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';

type GeneralSettingsFormProps = {
  initialValues: GeneralSettingsInitialValues;
};

export function GeneralSettingsForm({ initialValues }: GeneralSettingsFormProps) {
  const [state, formAction, isPending] = useActionState<UpdateAccountActionState, FormData>(
    updateAccountAction,
    {},
  );

  const name = state.values?.name ?? initialValues.name;
  const email = state.values?.email ?? initialValues.email;
  const phoneNumber = state.values?.phoneNumber ?? initialValues.phoneNumber ?? '';

  const nameField = getFieldState(state, 'name');
  const phoneNumberField = getFieldState(state, 'phoneNumber');
  const emailField = getFieldState(state, 'email');

  useToastMessage(state.error, {
    kind: 'error',
    skip: Boolean(state.fieldErrors),
  });
  useToastMessage(state.success, {
    kind: 'success',
  });

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={initialValues.image ?? undefined} alt={name} />
          <AvatarFallback className="justify-center text-lg">
            {(name || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <form className="space-y-4" action={formAction}>
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field data-invalid={nameField.invalid}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              defaultValue={name}
              aria-invalid={nameField.invalid}
              required
            />
            <FieldError>{nameField.error}</FieldError>
          </Field>

          <Field data-invalid={phoneNumberField.invalid}>
            <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              defaultValue={phoneNumber}
              aria-invalid={phoneNumberField.invalid}
            />
            <FieldError>{phoneNumberField.error}</FieldError>
          </Field>

          <Field data-invalid={emailField.invalid}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              defaultValue={email}
              aria-invalid={emailField.invalid}
              required
            />
            <FieldError>{emailField.error}</FieldError>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
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
    </>
  );
}
