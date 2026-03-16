# Run Locally

## Purpose

Start the starter in local development mode and verify the core flows quickly.

## Commands

Run these from the project root:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Local URLs

- Marketing home: `http://localhost:3000/`
- Pricing: `http://localhost:3000/pricing`
- Sign in: `http://localhost:3000/sign-in`
- Sign up: `http://localhost:3000/sign-up`
- Dashboard: `http://localhost:3000/dashboard`

## First Smoke Test

1. Open `/`
2. Open `/pricing`
3. Open `/sign-up`
4. Create or sign in to a user
5. Confirm `/dashboard` loads
6. Open `/dashboard/tasks`
7. Open `/dashboard/settings/account`
8. Open `/dashboard/settings/authentication`
9. Open `/dashboard/settings/team`

## If Something Breaks

Start by checking:

- `.env` exists and is complete
- `POSTGRES_URL` is correct
- migrations have been applied
- Stripe products exist
- at least one auth provider is enabled

## Related Docs

- `troubleshooting-setup.md`
- `../06-support/common-errors.md`
