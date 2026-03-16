# Seed Demo Data

## Purpose

Populate the starter with safe local data so you can inspect the dashboard and billing flows without building your own content first.

## Command

```bash
pnpm db:seed
```

## What Gets Seeded

The current seed script creates:

- a user with email `test@test.com`
- a team named `Test Team`
- an owner membership for that user
- Stripe products and prices for `Base` and `Plus`

## Important Note

The seed script talks to Stripe. That means `STRIPE_SECRET_KEY` must already be valid before you run it.

## When To Rerun

Use the seed when:

- you are setting up the project for the first time
- you reset the database
- you want the default billing catalog back

## When Not To Use It

Do not run this blindly in production. Review the script first if you want production seed data.

## Related Docs

- `database-setup.md`
- `billing-setup.md`
