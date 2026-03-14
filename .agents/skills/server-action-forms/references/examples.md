# Canonical patterns

## 1. Shared types

```ts
export type FieldErrors<TValues extends Record<string, unknown>> = Partial<
  Record<Extract<keyof TValues, string>, string[]>
>;

export type FormActionState<
  TValues extends Record<string, unknown> = Record<string, never>,
> = {
  error?: string;
  success?: string;
  values?: Partial<TValues>;
  fieldErrors?: FieldErrors<TValues>;
};
```

## 2. Boundary helper

```ts
import { z } from 'zod';
import type { User } from '@prisma/client';

import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import type { FormActionState } from '@/shared/types/form-action-state';

type ValidatedActionWithUserFunction<S extends z.ZodTypeAny> = (
  data: z.infer<S>,
  formData: FormData,
  user: User,
) => Promise<FormActionState<z.infer<S>>>;

export function validatedActionWithUser<S extends z.ZodTypeAny>(
  schema: S,
  action: ValidatedActionWithUserFunction<S>,
) {
  type Values = z.infer<S>;
  type State = FormActionState<Values>;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: 'User is not authenticated.',
      };
    }

    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: 'Please fix the highlighted fields.',
        values: rawValues as Partial<Values>,
        fieldErrors: parsed.error.flatten().fieldErrors as State['fieldErrors'],
      };
    }

    return action(parsed.data, formData, user);
  };
}
```

## 3. Field-state helper

```ts
import type { FormActionState } from '@/shared/types/form-action-state';

export function getFieldState<
  TValues extends Record<string, unknown>,
  TName extends Extract<keyof TValues, string>,
>(state: FormActionState<TValues>, name: TName) {
  const error = state.fieldErrors?.[name]?.[0];

  return {
    error,
    invalid: Boolean(error),
  };
}
```

## 4. Server function shape

```ts
export async function updateAccount({
  userId,
  name,
  email,
  phoneNumber,
}: UpdateAccountParams): Promise<UpdateAccountActionState> {
  try {
    await db.user.update({
      where: { id: userId },
      data: { name, email, phoneNumber },
    });

    return {
      success: 'Account updated successfully.',
      values: {
        name,
        email,
        phoneNumber,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        error: 'Please fix the highlighted fields.',
        values: {
          name,
          email,
          phoneNumber,
        },
        fieldErrors: {
          email: ['This email is already in use.'],
        },
      };
    }

    throw error;
  }
}
```

## 5. Client form shape

```tsx
const [state, formAction, isPending] = useActionState<UpdateAccountActionState, FormData>(
  updateAccountAction,
  {},
);

const name = state.values?.name ?? initialValues.name;
const email = state.values?.email ?? initialValues.email;
const phoneNumber = state.values?.phoneNumber ?? initialValues.phoneNumber ?? '';

const nameField = getFieldState(state, 'name');
const emailField = getFieldState(state, 'email');
const phoneNumberField = getFieldState(state, 'phoneNumber');
```

```tsx
<Field data-invalid={emailField.invalid}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input
    id="email"
    name="email"
    type="email"
    defaultValue={email}
    aria-invalid={emailField.invalid}
    required
  />
  <FieldError>{emailField.error}</FieldError>
</Field>
```

## 6. Heuristic for abstraction level

Use these defaults:

- one tiny shared state contract
- one tiny validation boundary helper
- one tiny field-state helper
- explicit field rendering in components

Avoid bigger abstractions unless the user explicitly asks for them.
