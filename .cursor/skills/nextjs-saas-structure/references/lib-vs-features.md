# Root `shared/` versus `features/`

## Core rule

Choose placement based on ownership, not on whether code is server-side, shared, or important.

- app-wide shared code not owned by one domain -> `shared/`
- product logic owned by one domain -> `features/<feature>/`

---

## `shared/` DOES

Root `shared/` does contain:

- database client setup
- auth framework setup
- provider registration
- Stripe or Supabase clients
- environment parsing
- framework integration code
- app-wide technical utilities
- app-wide reusable UI
- app-wide constants

Examples:

- `shared/lib/db/prisma.ts`
- `shared/lib/auth/providers.ts`
- `shared/lib/auth/auth.ts`
- `shared/lib/stripe/client.ts`
- `shared/lib/env.ts`
- `shared/components/ui/button.tsx`
- `shared/components/app/page-header.tsx`
- `shared/constants/routes.ts`

---

## `shared/` DOES NOT

Root `shared/` does not contain:

- task creation logic
- invitation workflows
- account deletion logic
- billing workflows owned by the billing feature
- feature-specific Prisma queries
- feature-specific validation
- product rules for one domain

Bad examples:

- `shared/lib/create-task.ts`
- `shared/lib/invite-member.ts`
- `shared/lib/delete-account.ts`
- `shared/lib/invoice-summary.ts`

These belong in their owning feature.

---

## `features/` DOES

`features/<feature>/` does contain:

- feature-specific server logic
- feature-specific Prisma queries
- feature-specific validation
- feature-specific UI
- feature workflows and business rules
- feature-owned helpers

Examples:

- `features/tasks/server/create-task.ts`
- `features/tasks/schemas/task.schema.ts`
- `features/teams/server/invite-member.ts`
- `features/auth/server/delete-account.ts`

---

## `features/` DOES NOT

`features/<feature>/` does not contain:

- global Prisma client setup
- auth framework bootstrap
- global Stripe client setup
- environment parsing
- app-wide technical helpers that are not feature-owned

Bad examples:

- `features/tasks/prisma.ts`
- `features/teams/env.ts`
- `features/auth/stripe-client.ts`

These belong in root `shared/`.

---

## Common mistakes

### Mistake 1

"It touches the database, so it belongs in `shared/`."

Wrong.
Database access that belongs to one feature should stay in that feature.

### Mistake 2

"It is reused in two places, so it must move to root `shared/`."

Wrong.
If both usages belong to the same feature, keep it in that feature.

### Mistake 3

"The root auth file needs it, so it can live in `features/auth/`."

Wrong.
Global auth infrastructure should not depend on `features/`.
Move supporting auth-system logic into `shared/lib/auth/`.

### Mistake 4

"The page is under `/admin`, so the code belongs in `features/admin/`."

Wrong.

`features/admin/` is for the admin shell, not every admin-only workflow.

Examples:

- `/admin/users` -> `features/users/`
- `/admin/members` when they are organization members -> `features/organizations/`
- `/admin/settings` when they are platform settings -> `features/system-settings/`

---

## Quick decision test

Ask:

1. Is this app-wide technical infrastructure?
2. Would it still make sense if the feature disappeared?
3. Is it owned by one product domain?

If the answer is:

- app-wide shared code -> `shared/`
- owned by one feature -> `features/<feature>/`

---

## Strong rule

`shared/` is not a misc folder.

Do not use root `shared/` as:

- a dumping ground
- a place for random server code
- a place for business logic that feels reusable
- a place for anything you do not know how to classify

When in doubt, prefer feature ownership first.
Move something to root `shared/` only when it is truly cross-feature app-level code.

---

## Activity log example

Use a shared helper such as `shared/lib/activity-log.ts` for the low-level insert.

Keep feature-owned lookups outside root `shared/`.

Good:

- `features/auth/server/linked-accounts.ts` gets any feature-owned data it needs, then calls the shared log helper
- `features/team/...` uses the same helper inside team workflows

Bad:

- `shared/lib/auth/...` importing team membership queries just to attach a `teamId`

If a global auth hook needs to write an activity row, let it call the shared helper directly with the data it already owns.
