# Naming

## Core rule

Use names that describe responsibility clearly.

Optimize for:

- fast scanning
- low ambiguity
- predictable imports
- consistency across the codebase

---

## Route files

Reserve these names for the `app/` directory only:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `route.ts`

Do not use `XxxPage.tsx` inside feature folders unless the file is truly a route file in `app/`.

Prefer:

- `general-settings-section.tsx`
- `security-settings-panel.tsx`
- `general-settings-form.tsx`
- `delete-account-card.tsx`

Avoid:

- `general-settings-page.tsx`
- `security-settings-page.tsx`

---

## Components

Use `kebab-case.tsx`.

Prefer names that communicate UI role:

- `invoice-form.tsx`
- `billing-section.tsx`
- `customer-card.tsx`
- `usage-panel.tsx`

Helpful suffixes:

- `form`
- `section`
- `panel`
- `card`
- `dialog`
- `table`
- `list`

Do not use vague names like:

- `data.tsx`
- `info.tsx`
- `main.tsx`
- `utils-card.tsx`

---

## Actions

Use kebab-case with `.action.ts`.

Examples:

- `create-invoice.action.ts`
- `delete-account.action.ts`
- `update-account.action.ts`

This makes server actions easy to recognize.

---

## Schemas

Use singular domain names with `.schema.ts`.

Examples:

- `invoice.schema.ts`
- `account.schema.ts`
- `billing.schema.ts`

Keep runtime validation here.

---

## Types

Use `.types.ts` for shared contracts.

Examples:

- `auth.types.ts`
- `billing.types.ts`
- `invoice.types.ts`

Do not create many tiny type files if a feature only has a few shared contracts.

---

## Config

Use descriptive kebab-case or domain names with `.config.ts`.

Examples:

- `billing.config.ts`
- `navigation.config.ts`
- `roles.config.ts`
- `marketing.config.ts`

Use config files for editable configuration objects, not for workflows.

Prefer:

- one cohesive config file per domain concern
- names that tell the developer exactly what can be changed
- `features/<feature>/config/` for feature-owned config
- `shared/config/` for app-wide config

Avoid:

- `config.ts`
- `settings.ts`
- `options.ts`
- `billing.ts` when the file is really configuration

Do not put these in `.config.ts` files:

- database queries
- SDK client initialization
- request handlers
- mutations or side effects
- orchestration logic

If the file needs async work or runtime effects, it probably belongs in `server/` or `shared/lib/`, not in `config/`.

---

## Hooks

Use `use-xxx.ts`.

Examples:

- `use-billing-filters.ts`
- `use-invoice-selection.ts`

Do not create a hook when:

- a plain function is enough
- the logic belongs in a server component
- the hook is only wrapping another function without adding real value

---

## Server files

There is no mandatory suffix, but names should describe the server responsibility directly.

Good examples:

- `billing-usage.ts`
- `complete-post-sign-in.ts`
- `create-invoice.ts`
- `current-user.ts`
- `linked-accounts.ts`

Keep names concrete and feature-scoped.

---

## Utils files

Use descriptive names based on the helper purpose.

Examples:

- `format-customer-label.ts`
- `invoice-totals.ts`
- `post-sign-in.ts`

Avoid vague names like:

- `common.ts`
- `helpers.ts`
- `misc.ts`

---

## Naming consistency

Do not mix styles in the same codebase.

Pick one consistent style and keep it:

- components -> kebab-case
- non-component files -> kebab-case
- route files -> Next.js reserved names

Consistency matters more than inventing new naming patterns per feature.
