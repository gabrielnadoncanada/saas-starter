# End User Documentation

## Purpose

This folder is the buyer-facing manual for the starter. It is written for someone who wants to install the app, configure the required services, and start customizing without reverse-engineering the codebase first.

## Who This Is For

- Founders shipping their own SaaS
- Agencies adapting the starter for a client project
- Small technical teams that want obvious edit paths

## Read This First

If you just bought the starter, follow these docs in order:

1. `02-getting-started/getting-started.md`
2. `02-getting-started/installation.md`
3. `02-getting-started/environment-variables.md`
4. `02-getting-started/database-setup.md`
5. `02-getting-started/auth-setup.md`
6. `02-getting-started/billing-setup.md`
7. `02-getting-started/run-locally.md`
8. `02-getting-started/deployment.md`

## I Want To Customize Something

Start here based on the job:

- Auth flow and providers: `04-customization/auth/`
- Branding and theme: `04-customization/branding/`
- Landing page and pricing page: `04-customization/marketing/`
- Dashboard pages and navigation: `04-customization/dashboard/`
- Account and profile settings: `04-customization/account/`
- Database entities and seed data: `04-customization/data/`
- Team or workspace behavior: `04-customization/workspace/`

## Best Supporting Docs

- Starter structure: `03-understanding-the-starter/project-structure.md`
- Architecture overview: `03-understanding-the-starter/architecture-overview.md`
- Environment variables: `05-reference/env-reference.md`
- Routes: `05-reference/routes-reference.md`
- Scripts: `05-reference/scripts-reference.md`
- Common setup issues: `06-support/common-errors.md`

## What This Starter Includes

At the time of writing, the repo gives you:

- Next.js 16 App Router
- NextAuth-based sign-in and sign-up pages
- PostgreSQL with Prisma
- Stripe checkout and subscription webhook handling
- Team-aware data model
- Dashboard shell, account settings, auth settings, activity log, and tasks

## Documentation Approach

These docs point to the actual files in this repo. If a guide ever feels longer than the task deserves, treat that as a product signal and simplify the code path instead of adding more theory.
