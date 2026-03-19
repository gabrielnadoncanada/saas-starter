# SaaS Starter

A production-ready Next.js SaaS starter with authentication, Stripe billing, plan gating, team management, and a polished dashboard — built for technical founders and small teams who want to ship fast.

## Who is this for

- Solo founders launching a SaaS product
- Small technical teams who don't want to rebuild auth + billing + teams from scratch
- Freelancers and agencies starting client projects from a strong base

## What's included

- **Authentication** — Magic link, Google, and GitHub OAuth via NextAuth v5. Account linking, session management, and soft delete built in.
- **Stripe billing** — Subscriptions (flat and per-seat), one-time payments, checkout, customer portal, and webhook handling.
- **Plan gating** — Capability-based feature flags and usage limits (monthly quotas, team member caps). Single source of truth in one config file.
- **Team management** — Multi-team support with roles (Owner, Admin, Member), invitations, and cookie-based team switching.
- **Dashboard shell** — Sidebar navigation, command menu, theme switching, responsive layout, and settings pages.
- **Tasks CRUD example** — Full working feature with TanStack Table (sort, filter, paginate, bulk actions), server actions, Zod validation, and plan-gated creation.
- **Activity logging** — Audit trail for sign-ins, account changes, team actions, and provider linking.
- **Email** — Resend integration with React Email templates for magic links and team invitations.
- **Documentation** — 72 docs including 31 step-by-step customization guides covering auth, billing, branding, dashboard, data model, and workspace changes.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI |
| Auth | NextAuth v5 (beta) |
| Database | PostgreSQL, Prisma ORM |
| Payments | Stripe |
| Email | Resend, React Email |
| Tables | TanStack React Table v8 |
| Validation | Zod |
| Testing | Vitest |

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your Postgres URL, Stripe keys, auth secrets, and OAuth credentials

# 3. Start the database (or use an existing Postgres instance)
docker compose up -d

# 4. Run migrations and seed demo data
pnpm db:migrate
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment setup

Copy `.env.example` and configure:

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth session secret |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `BASE_URL` | Your app URL (`http://localhost:3000` locally) |
| `RESEND_API_KEY` | Resend email API key (for magic links) |
| `EMAIL_FROM` | Sender address for transactional emails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional) |

See the [full environment reference](docs_end_user/02-getting-started/environment-variables.md) for details.

## How billing works

Plans are defined in a single config file (`features/billing/config/billing.config.ts`). Stripe price IDs from env select the checkout targets. The app manages what each plan gives access to.

```
Stripe decides which plan is active.
Your config decides what that plan gives.
```

**To add a plan:** Create the prices in Stripe, add their `STRIPE_PRICE_*` env vars, then define capabilities, limits, and pricing behavior in `billing.config.ts`.

**To gate a feature:** Call `assertCapability(planId, "your.capability")` in your server action.

**To enforce a quota:** Call `assertLimit(planId, "yourLimit", currentUsage)` after checking usage.

Three pricing models are supported out of the box: flat-rate subscriptions, per-seat billing, and one-time payments.

## Project structure

```
app/                → Routes and layouts (thin — delegates to features)
features/           → Product code organized by domain
  auth/             → Sign-in, sign-up, post-sign-in, OAuth
  billing/          → Plans, guards, checkout, webhooks, usage tracking
  tasks/            → CRUD example with plan gating
  teams/            → Team management, invitations, roles
  account/          → Profile, settings, account deletion
shared/             → Cross-feature infrastructure
  components/       → UI components, layout, navigation
  lib/              → Auth, database, email, Stripe clients
  hooks/            → Reusable React hooks
  constants/        → Routes, terminology
prisma/             → Schema, migrations, seed
docs_end_user/      → Setup, customization, and reference guides
```

## Why this starter

- **Launch faster** — Auth, billing, teams, and a dashboard shell are already wired together. Start building your product features on day one.
- **Understand quickly** — Feature-organized code, thin routes, and short files. No custom frameworks to learn.
- **Modify safely** — Plan gating and usage limits are centralized. Adding a new gated feature is a two-line change.
- **Customize freely** — 31 customization guides cover common changes: rename teams, add auth providers, change plans, rebrand the UI.
- **Modern defaults** — Next.js 16, React 19, Tailwind v4, TypeScript strict, Server Components, Server Actions.

## Documentation

Full documentation is in the [`docs_end_user/`](docs_end_user/) directory:

- [Getting started](docs_end_user/02-getting-started/getting-started.md)
- [Architecture overview](docs_end_user/03-understanding-the-starter/architecture-overview.md)
- [Customization guides](docs_end_user/04-customization/)
- [Reference](docs_end_user/05-reference/)

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm email:dev` | Preview email templates |

## License

MIT
