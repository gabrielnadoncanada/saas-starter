# SaaS Starter

A production-ready Next.js SaaS starter with auth, Stripe billing, multi-tenant organizations, an admin panel, and an AI assistant already wired together. Built to be read and extended, not decoded.

## What ships

- **Authentication** — Better Auth with email/password, magic links, Google and GitHub OAuth, 2FA, account linking, and soft delete.
- **Stripe billing** — Checkout, customer portal, webhook handling, and per-org subscription state enforced in the app.
- **Plan gating** — Capability-based feature flags and usage limits with one source of truth in `config/billing.config.ts`.
- **Organizations** — Multi-org support with invitations, active org switching, and role-aware access.
- **Admin panel** — User and organization directories, impersonation, ban/unban, plan visibility.
- **AI assistant** — Org-scoped chat with tool calls, streaming, chart artifacts, and usage-aware access.
- **Email** — Resend + React Email templates for auth and team invitations.

## Tech stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript (strict)                 |
| UI         | Tailwind CSS 4, shadcn/ui, Radix UI |
| Auth       | Better Auth                         |
| Database   | PostgreSQL, Prisma ORM              |
| Payments   | Stripe                              |
| Email      | Resend, React Email                 |
| AI         | Vercel AI SDK                       |
| Validation | Zod                                 |
| Testing    | Vitest                              |

## Quick start

```bash
pnpm install
pnpm setup
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm setup` walks through every required and optional env var and writes `.env` for you. Then open [http://localhost:3000](http://localhost:3000).

Seeded local accounts:

- `demo@starter.local` / `demo123`
- `admin@admin.com` / `admin123`

## Environment setup

Copy `.env.example` to `.env` and fill in the required values:

| Variable              | Purpose                          |
| --------------------- | -------------------------------- |
| `POSTGRES_URL`        | PostgreSQL connection string     |
| `AUTH_SECRET`         | Secret for signing auth sessions |
| `STRIPE_SECRET_KEY`   | Stripe API key                   |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `BASE_URL`            | Your app URL (`http://localhost:3000` locally) |
| `RESEND_API_KEY`      | Resend email API key             |
| `EMAIL_FROM`          | Sender address for transactional email |

See `.env.example` for the full, authoritative list and `/docs/getting-started` for the first-run path.

## Project structure

```
app/                -> Routes and layouts (thin - delegates to features)
features/           -> Product code organized by domain
  auth/             -> Sign-in, sign-up, post-sign-in, OAuth
  billing/          -> Plans, guards, checkout, webhooks, usage
  assistant/        -> AI chat, tools, conversations, model selection
  tasks/            -> CRUD example with plan gating
  organizations/    -> Org management, invitations, roles
  account/          -> Profile, settings, account deletion
components/         -> Shared UI, layout, navigation
lib/                -> Auth, database, email, Stripe clients
config/             -> App-wide typed configuration
prisma/             -> Schema, migrations, seed
content/docs/       -> Documentation (Fumadocs MDX)
```

## How billing works

Plans are defined in `config/billing.config.ts`. Stripe price IDs from env select the checkout targets; the billing config decides what each plan unlocks.

```
Stripe decides which plan is active.
Your config decides what that plan gives.
```

**To add a plan**: Create prices in Stripe, add their `STRIPE_PRICE_*` env vars, then define capabilities, limits, and pricing behavior in `config/billing.config.ts`.

**To gate a feature**: Call `assertCapability(planId, "your.capability")` in your server action.

**To enforce a quota**: Call `assertLimit(planId, "yourLimit", currentUsage)` after checking usage.

## Scripts

| Command           | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `pnpm dev`        | Start dev server with Turbopack                            |
| `pnpm build`      | Production build                                           |
| `pnpm test`       | Run tests                                                  |
| `pnpm db:migrate` | Run database migrations                                    |
| `pnpm db:seed`    | Seed demo data                                             |
| `pnpm db:studio`  | Open Prisma Studio                                         |
| `pnpm email:dev`  | Preview email templates                                    |

## Documentation

Documentation is available at `/docs` when the app is running, or browse `content/docs/` in the repo.

## License

This software is proprietary and licensed under a commercial license (see `LICENSE.md`). You may use it to build unlimited end products, but you may not redistribute, resell, or share the source code.
