---
name: server-action-forms
description: build and refactor next.js app router forms using server actions first, react useactionstate by default, a shared formactionstate contract, a small getfieldstate helper, and shadcn field components. use when chatgpt needs to create a new form, refactor an existing form, wire zod validation to server actions, standardize field-level errors, or enforce the team's form conventions. do not use react hook form for this skill unless the user explicitly opts out of these standards.
---

Build forms with a server-action-first standard optimized for indie SaaS codebases.

## Core standard

Always follow these rules unless the user explicitly asks for a different pattern:

1. Use Next.js Server Actions first.
2. Use `useActionState` by default in client form components.
3. Use a shared `FormActionState<TValues>` contract.
4. Use `validatedActionWithUser`-style boundary helpers when relevant.
5. Use shadcn `Field`, `FieldLabel`, and `FieldError` for field rendering.
6. Use a tiny `getFieldState(state, name)` helper for field-level DX.
7. Do **not** introduce React Hook Form.
8. Do **not** introduce mini-RHF abstractions like `FormInput`, `getFormField`, controllers, registries, or generic field wrappers that hide every control.
9. Prefer simple local value derivation in the form component.
10. Keep forms easy to read for the next developer.

## Required contracts

### Shared form state

Use this shared type as the baseline contract:

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

### Shared field-state helper

Use this helper when the form renders shadcn `Field` blocks:

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

Keep this helper tiny. Do not expand it into a field engine.

## Form architecture

### Server action layer

Use a schema-driven action boundary.

Default pattern:

- schema in `features/<feature>/schemas/`
- action in `features/<feature>/actions/`
- server-only business logic in `features/<feature>/server/`
- feature types in `features/<feature>/types/`

### Action return shape

Server actions and server functions used by forms should return only this style of data:

- `success`
- `error`
- `values`
- `fieldErrors`

Do not return ad hoc top-level form fields like `name`, `phoneNumber`, `provider`, or similar. Put submitted values in `values`.

### Validation behavior

For validation or expected business failures:

- return structured state
- do not throw

For truly unexpected failures:

- throw or let the error propagate

### DB and business logic

Keep Prisma or database logic out of the server action when possible. Put it in `server/` functions and have those return `FormActionState<TValues>`.

## Client form rules

### Default form pattern

In the client component:

1. call `useActionState(action, {})`
2. derive display values locally
3. derive field state with `getFieldState`
4. render shadcn `Field` components
5. use `FieldError` for per-field messaging
6. use a global message block for `state.error` or `state.success`

### Value derivation

Prefer explicit local variables:

```ts
const name = state.values?.name ?? initialValues.name;
const email = state.values?.email ?? initialValues.email;
const phoneNumber = state.values?.phoneNumber ?? initialValues.phoneNumber ?? '';
```

This is preferred over bigger helpers if the helper worsens readability or typing.

### shadcn field rendering

Default rendering pattern:

```tsx
const emailField = getFieldState(state, 'email');

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

Use the same idea for textarea, select, radio group, switch, calendar, or other shadcn-compatible controls. The important rule is:

- use `getFieldState` for `invalid` and `error`
- keep the actual control explicit in the component
- do not hide every field type behind a generic wrapper

## Refactor workflow

When refactoring an existing form, follow this order:

1. Identify the current submission model.
   - **Uses React Hook Form or controller-like patterns?** Refactor away from RHF unless the user explicitly asks to keep it.
   - **Uses ad hoc state fields?** Normalize to `FormActionState<TValues>`.
2. Normalize the schema and action return contract.
3. Move DB/business logic into `server/` if needed.
4. Update the client component to `useActionState`.
5. Replace top-level field returns like `state.name` with `state.values?.name` derivation.
6. Add or keep shadcn `Field` usage.
7. Introduce `getFieldState` if it reduces repeated `Boolean(state.fieldErrors?.x)` and `state.fieldErrors?.x?.[0]` noise.
8. Remove over-abstractions.
9. Keep the final code shorter or clearer than the original.

## Anti-patterns

Avoid these unless the user explicitly requests them:

- React Hook Form
- `Controller`
- `zodResolver`
- `register`
- per-control wrapper explosion like `FormInput`, `FormTextarea`, `FormSelect`, `FormCalendar`
- helper abstractions that force ugly casts like `String(field.value)`
- returning only the first top-level error string from schema validation
- returning raw Prisma errors to the UI
- using `Promise.all` for critical write + non-critical activity log if that can surface false failure to the user

## Good default outputs

When asked to create or refactor a form, produce:

1. the updated shared types if needed
2. the updated schema if needed
3. the updated server action
4. the updated server function
5. the updated client form component
6. a short explanation of what changed and why

Prefer concrete code over architecture talk.

## Reference patterns

See `references/examples.md` for canonical examples to follow.
