# Root app folders versus `features/`

## Core rule

Choose placement based on ownership, not on whether code is server-side, shared, or important.

- app-wide code not owned by one domain -> root folders
- product logic owned by one domain -> `features/<feature>/`

---

## Root folders DO

Root folders do contain:

- database client setup
- auth framework setup
- provider registration
- Stripe or Supabase clients
- environment parsing
- framework integration code
- app-wide technical utilities
- app-wide reusable UI
- app-wide constants
- global styles

Examples:

- `lib/db/prisma.ts`
- `lib/auth/providers.ts`
- `lib/auth/auth.ts`
- `lib/stripe/client.ts`
- `lib/env.ts`
- `components/ui/button.tsx`
- `components/app/page-header.tsx`
- `constants/routes.ts`
- `styles/globals.css`

---

## Root folders DO NOT

Root folders do not contain:

- task creation logic
- invitation workflows
- account deletion logic
- billing workflows owned by the billing feature
- feature-specific Prisma queries
- feature-specific validation
- product rules for one domain

Bad examples:

- `lib/create-task.ts`
- `lib/invite-member.ts`
- `lib/delete-account.ts`
- `lib/invoice-summary.ts`

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

These belong in root folders.

---

## Common mistakes

### Mistake 1

"It touches the database, so it belongs in a root folder."

Wrong.
Database access that belongs to one feature should stay in that feature.

### Mistake 2

"It is reused in two places, so it must move to a root folder."

Wrong.
If both usages belong to the same feature, keep it in that feature.

### Mistake 3

"The root auth file needs it, so it can live in `features/auth/`."

Wrong.
Global auth infrastructure should not depend on `features/`.
Move supporting auth-system logic into `lib/auth/`.

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

- app-wide code -> root folders
- owned by one feature -> `features/<feature>/`

---

## Strong rule

Root folders are not misc folders.

Do not use `lib/`, `components/`, `hooks/`, or `types/` as:

- dumping grounds
- places for random server code
- homes for business logic that only feels reusable
- catch-alls for anything you do not know how to classify

When in doubt, prefer feature ownership first.
Promote something to a root folder only when it is truly app-level code.

---

## Activity log example

Use a shared helper such as `lib/activity-log.ts` for the low-level insert.

Keep feature-owned lookups outside root folders.

Good:

- `features/auth/server/linked-accounts.ts` gets any feature-owned data it needs, then calls the shared log helper
- `features/team/...` uses the same helper inside team workflows

Bad:

- `lib/auth/...` importing team membership queries just to attach a `teamId`

If a global auth hook needs to write an activity row, let it call the shared helper directly with the data it already owns.
