# Installation

## Purpose

Install the starter and prepare the local development environment.

## Files To Know

- `package.json`
- `.env.example`
- `shared/lib/db/setup.ts`

## Steps

### Step 1 - Install the required tools

Make sure these commands work on your machine:

- `node -v`
- `pnpm -v`
- `docker -v` if you want local Postgres
- `stripe --version` if you want local billing setup

### Step 2 - Install dependencies

From the project root, run:

```bash
pnpm install
```

The repo runs `prisma generate` in `postinstall`, so this step also prepares the Prisma client.

### Step 3 - Create your environment file

Copy `.env.example` to `.env` and keep using `.env` for this project. The setup script and the Prisma adapter both read from `.env`.

### Step 4 - Decide how you want to create the database

You have two valid paths:

- Use your own Postgres instance and set `POSTGRES_URL`
- Run `pnpm db:setup` to generate a local Docker-based Postgres setup and a starter `.env`

### Step 5 - Decide which auth methods you want on day one

The starter supports:

- magic link via Resend
- Google OAuth
- GitHub OAuth

You only need one method to start testing.

## Notes About `pnpm db:setup`

`pnpm db:setup` is an interactive script that:

- checks Stripe CLI
- can create a local Docker Postgres container
- generates `AUTH_SECRET`
- writes a new `.env`

Read `database-setup.md` and `billing-setup.md` before using it so you understand what it writes and what still needs to be added manually.

## Common Mistakes

- Running `npm install` and `pnpm install` interchangeably
- Forgetting to create `.env`
- Assuming the starter uses SQLite

## Related Docs

- `environment-variables.md`
- `database-setup.md`
- `run-locally.md`
