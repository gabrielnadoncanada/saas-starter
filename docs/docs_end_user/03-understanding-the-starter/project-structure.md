# Project Structure

## Purpose

Show where buyers should usually edit code first.

## Top-Level Folders

### `app/`

Route files, layouts, and API routes.

Use this folder when you need to:

- add or remove pages
- change route-level metadata or layout structure
- edit API route handlers

### `features/`

Business logic grouped by domain:

- `account`
- `auth`
- `billing`
- `tasks`
- `teams`

This is the main place to customize app behavior.

### `shared/`

Cross-feature code such as:

- UI primitives
- layout shell
- auth helpers
- Prisma client
- Stripe client
- route constants

Touch this only when the change is genuinely shared.

### `prisma/`

Database schema pieces and migrations.

Use this for:

- new tables
- new columns
- indexes
- migration history

## Fast Edit Map

- change auth providers: `shared/lib/auth/index.ts` and `shared/lib/auth/oauth-config.ts`
- change sign-in page copy or layout: `app/(auth)/sign-in/page.tsx`
- change dashboard nav: `shared/components/navigation/config/sidebar-data.ts`
- change pricing page: `features/billing/components/PricingSection.tsx`
- change tasks feature: `features/tasks/`
- change team behavior: `features/teams/`
- change DB schema: `prisma/models/*.prisma`

## Practical Rule

Prefer editing inside the relevant feature before adding new shared infrastructure. That keeps common buyer changes local and easier to reason about.

## Related Docs

- `architecture-overview.md`
- `../04-customization/dashboard/how-to-add-dashboard-page.md`
