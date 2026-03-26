# Database Setup

## Purpose

Connect the starter to PostgreSQL, run the schema, and create seed data you can use while customizing.

## Files To Edit Or Run

- `.env`
- `prisma/schema.prisma`
- `prisma/models/auth.prisma`
- `prisma/models/teams.prisma`
- `prisma/models/tasks.prisma`
- `shared/lib/db/setup.ts`
- `shared/lib/db/seed.ts`

## Option A - Use Your Own Postgres Database

1. Create a PostgreSQL database
2. Put the connection string in `POSTGRES_URL`
3. Run `pnpm db:generate`
4. Run `pnpm db:migrate`
5. Run `pnpm db:seed`

This is the simplest path if you already use Neon, Supabase, Railway, Render, or local Postgres.

## Option B - Use The Interactive Setup Script

Run:

```bash
pnpm db:setup
```

The script can:

- create `docker-compose.yml`
- start a local Postgres container on port `54322`
- write a new `.env`

After that, still run:

```bash
pnpm db:migrate
pnpm db:seed
```

## What The Seed Creates

The seed script currently creates:

- a test user with email `test@test.com`
- a team called `Test Team`
- an owner membership between them
- Stripe products and prices

Use this as disposable demo data, not as production content.

## Data Model Overview

The app centers around three main groups:

- auth tables: users, accounts, sessions, verification tokens
- team tables: teams, memberships, invitations, activity log
- product tables: tasks

Tasks are team-scoped by default.

## Common Mistakes

- Running `pnpm dev` before `pnpm db:migrate`
- Forgetting that the starter expects PostgreSQL, not SQLite
- Seeding before `STRIPE_SECRET_KEY` is set, which breaks Stripe product creation

## Related Docs

- `seed-demo-data.md`
- `../03-understanding-the-starter/data-model-overview.md`
- `../06-support/troubleshooting-database.md`
