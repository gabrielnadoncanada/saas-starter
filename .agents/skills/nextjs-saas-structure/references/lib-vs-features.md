# Global `lib/` versus `features/`

## Core rule

Choose placement based on ownership, not on whether code is server-side, shared, or important.

- global technical infrastructure owned by the app -> `lib/`
- product logic owned by one domain -> `features/<feature>/`

---

## `lib/` DOES

Global `lib/` does contain:

- database client setup
- auth framework setup
- provider registration
- Stripe or Supabase clients
- environment parsing
- framework integration code
- app-wide technical utilities

Examples:

- `lib/db/prisma.ts`
- `lib/auth/providers.ts`
- `lib/auth/auth.ts`
- `lib/stripe/client.ts`
- `lib/env.ts`

---

## `lib/` DOES NOT

Global `lib/` does not contain:

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

These belong in global `lib/`.

---

## Common mistakes

### Mistake 1

"It touches the database, so it belongs in `lib/`."

Wrong.
Database access that belongs to one feature should stay in that feature.

### Mistake 2

"It is reused in two places, so it must move to global `lib/`."

Wrong.
If both usages belong to the same feature, keep it in that feature.

### Mistake 3

"The root auth file needs it, so it can live in `features/auth/`."

Wrong.
Global auth infrastructure should not depend on `features/`.
Move supporting auth-system logic into `lib/auth/`.

---

## Quick decision test

Ask:

1. Is this app-wide technical infrastructure?
2. Would it still make sense if the feature disappeared?
3. Is it owned by one product domain?

If the answer is:

- app-wide infrastructure -> `lib/`
- owned by one feature -> `features/<feature>/`

---

## Strong rule

`lib/` is not a misc folder.

Do not use global `lib/` as:

- a dumping ground
- a place for random server code
- a place for business logic that feels reusable
- a place for anything you do not know how to classify

When in doubt, prefer feature ownership first.
Move something to global `lib/` only when it is truly cross-feature technical infrastructure.

---

## Activity log example

Use a shared helper such as `lib/activity-log.ts` for the low-level insert.

Keep feature-owned lookups outside global `lib/`.

Good:

- `features/auth/server/linked-accounts.ts` gets any feature-owned data it needs, then calls the shared log helper
- `features/team/...` uses the same helper inside team workflows

Bad:

- `lib/auth/...` importing team membership queries just to attach a `teamId`

If a global auth hook needs to write an activity row, let it call the shared helper directly with the data it already owns.
