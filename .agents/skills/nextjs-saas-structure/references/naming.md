# Naming

Use these naming rules to keep the codebase consistent.

## Goal

Naming should make file responsibility obvious at a glance.

Prefer consistent responsibility-based suffixes over random naming styles.

## 1) Components

Use PascalCase and match the exported component name.

Examples:

- `InvoiceForm.tsx`
- `LoginForm.tsx`
- `Sidebar.tsx`
- `InvoiceTable.tsx`

Rules:

- one main component per file
- file name should match the component export
- avoid vague names like `Component.tsx` or `Section.tsx`

## 2) Hooks

Use `use` + PascalCase.

Examples:

- `useInvoiceDialog.ts`
- `useInvoiceFilters.ts`
- `useDebounce.ts`
- `useMediaQuery.ts`

Rules:

- only use hook naming for real React hooks
- do not name pure helper functions as hooks
- if it does not use React behavior, do not prefix it with `use`

Bad example:

```ts
export function useCalculateInvoiceTotal() {}
```

Better:

```ts
export function calculateInvoiceTotal() {}
```

## 3) Schemas

Use `domain.schema.ts`.

Examples:

- `invoice.schema.ts`
- `login.schema.ts`
- `customer.schema.ts`

Use schema files for:

- zod validation
- input contracts
- parsing rules
- structured validation logic

## 4) Types

Use `domain.types.ts`.

Examples:

- `invoice.types.ts`
- `customer.types.ts`
- `auth.types.ts`

Use for:

- interfaces
- type aliases
- domain type contracts

## 5) Mappers

Use `domain.mapper.ts`.

Examples:

- `invoice.mapper.ts`
- `customer.mapper.ts`

Use mapper files for:

- data transformations
- db-to-ui mapping
- form-to-payload mapping
- transport normalization

Do not mix naming styles like:

- `invoice.schema.ts`
- `invoice-mapper.ts`

Prefer:

- `invoice.schema.ts`
- `invoice.mapper.ts`

## 6) Constants

Use `domain.constants.ts`.

Examples:

- `invoice.constants.ts`
- `billing.constants.ts`

Use for:

- domain-specific defaults
- reusable labels
- stable config values

Do not create constants files unless there is more than one meaningful constant.

## 7) Actions

Use one consistent naming style across the repo.

Recommended default:

- `create-invoice.action.ts`
- `update-customer.action.ts`
- `sign-in.action.ts`

Use action files for:

- server actions
- user-triggered mutations
- action-based domain operations

Do not invent several styles in the same repository.

## 8) Pure helpers

Use descriptive responsibility-based names.

Examples:

- `invoice-total.ts`
- `currency-format.ts`
- `date-range.ts`

If the file has a clear role, name it after that role.

Avoid broad names like:

- `helpers.ts`
- `utils.ts`
- `common.ts`

unless the scope is very small and local.

## 9) Folder naming

Use lowercase folder names.

Examples:

- `features/invoices/`
- `features/customers/`
- `components/shared/`

Keep folder names short, explicit, and domain-based.

## 10) Consistency rules

Once a style is chosen, keep it consistent.

Preferred style:

- components -> `PascalCase.tsx`
- hooks -> `useXxx.ts`
- schemas/types/mappers/constants -> `domain.suffix.ts`
- actions -> `kebab-case.action.ts`

Examples of a good set:

- `InvoiceForm.tsx`
- `useInvoiceDialog.ts`
- `invoice.schema.ts`
- `invoice.types.ts`
- `invoice.mapper.ts`
- `create-invoice.action.ts`

## 11) Default recommendation

Use this naming model by default:

- `ComponentName.tsx`
- `useThing.ts`
- `thing.schema.ts`
- `thing.types.ts`
- `thing.mapper.ts`
- `thing.constants.ts`
- `do-something.action.ts`

This should be the default answer unless the user already has an existing repo convention.
