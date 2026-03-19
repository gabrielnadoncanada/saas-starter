# Architecture Overview

## Purpose

Explain how the starter is organized so you can find the right edit path quickly.

## High-Level Shape

The app is split into a small number of obvious layers:

- `app/` for routes and layouts
- `features/` for product-specific UI, actions, schemas, and server code
- `shared/` for cross-feature components, auth helpers, DB client, Stripe client, and constants
- `prisma/` for schema and migrations

## How To Read It

Use this rule first:

- route entry points live in `app/`
- feature logic lives in `features/`
- reusable infrastructure lives in `shared/`

If you keep that model in mind, most changes are easy to locate.

## Example Flow: Sign-In To Dashboard

1. The user opens `/sign-in`
2. `app/(auth)/sign-in/page.tsx` renders the auth UI
3. `shared/lib/auth/index.ts` configures Better Auth
4. `shared/lib/auth/oauth-config.ts` decides which auth methods are enabled
5. `proxy.ts` protects `/dashboard`
6. `app/post-sign-in/page.tsx` provisions or resumes the user flow

## Example Flow: Pricing To Stripe

1. The user opens `/pricing`
2. `features/billing/components/PricingSection.tsx` loads products and prices from Stripe
3. a pricing form submits to `checkoutAction`
4. Stripe checkout starts
5. Stripe later calls `/api/stripe/webhook`
6. the app updates billing state on the team

## Example Flow: Dashboard Tasks

1. `app/(app)/dashboard/tasks/page.tsx` loads tasks for the current team
2. `features/tasks/server/tasks.ts` reads team-scoped data
3. task dialogs and table UI live in `features/tasks/components/`

## Design Intent

This starter is not trying to hide Next.js behind an internal framework. Most customizations should still feel like normal Next.js and Prisma work.

## Related Docs

- `project-structure.md`
- `request-flow.md`
- `data-model-overview.md`
