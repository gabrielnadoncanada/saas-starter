# Getting Started

## Purpose

This is the first guide to read after purchase. It gives you the shortest path from a fresh clone to a working local app.

## Expected Time

- 10 to 20 minutes if you already have Node, pnpm, Docker, and Stripe CLI
- Longer if you still need to create Stripe, Postgres, Google, GitHub, or Resend credentials

## Expected Outcome

By the end, you should be able to:

- run the app locally
- sign in with at least one auth method
- connect to PostgreSQL
- load dashboard data
- see pricing plans and start checkout

## Recommended Order

1. Read `installation.md`
2. Fill `.env` using `environment-variables.md`
3. Set up PostgreSQL with `database-setup.md`
4. Configure auth with `auth-setup.md`
5. Configure Stripe with `billing-setup.md`
6. Start the app with `run-locally.md`
7. If you plan to ship immediately, read `deployment.md`

## The Short Version

1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Fill the required environment variables
4. Run `pnpm db:generate`
5. Run `pnpm db:migrate`
6. Run `pnpm db:seed`
7. Start the app with `pnpm dev`
8. Open `http://localhost:3000`
9. Test sign-up, sign-in, and dashboard access
10. Test the pricing page and Stripe checkout

## Before You Start

You will get through setup faster if you already have:

- Node.js 20 or newer
- `pnpm`
- a PostgreSQL database
- a Stripe account
- Stripe CLI for local webhooks
- a Resend account if you want magic-link auth
- Google and GitHub OAuth apps if you want social auth

## Common First-Day Mistakes

- Editing `.env.local` instead of `.env`
- Running the app before the database migration is applied
- Configuring social auth but forgetting the callback URL
- Expecting billing to work without Stripe products and webhook signing secret

## Related Docs

- `installation.md`
- `environment-variables.md`
- `database-setup.md`
- `auth-setup.md`
- `billing-setup.md`
- `troubleshooting-setup.md`
