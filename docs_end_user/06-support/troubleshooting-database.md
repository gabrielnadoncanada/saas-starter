# Troubleshooting Database

## Prisma client generated but queries fail

Generation only builds the client. It does not prove the database is reachable or migrated.

## Migrations fail

Check:

- `POSTGRES_URL`
- database permissions
- whether the target database already contains conflicting tables

## Seed fails

The seed script needs:

- a working database
- a valid `STRIPE_SECRET_KEY`

If Stripe is not configured yet, fix that first.

## Dashboard pages load but data is empty

That may be normal if you have not seeded or created data yet. Start with `pnpm db:seed`.
