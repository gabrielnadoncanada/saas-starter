# SaaS Starter

A production-ready Next.js SaaS starter for technical founders building real B2B or AI SaaS products. Auth, Stripe billing, organizations, admin surfaces, and an AI assistant are already wired together in a codebase built to be read, not decoded.

## Who This Is For

- Technical founders who want a serious B2B foundation without a heavy starter kit
- Small product teams that need billing, teams, admin, and account surfaces on day one
- Builders who care as much about time-to-understand as time-to-launch

## Not The Right Fit If

- You only need a basic landing page, login, and Stripe button for a very simple solo MVP
- You want a massive framework with layers of abstraction, plugins, and enterprise ceremony
- You are optimizing for the cheapest starter possible instead of the clearest one to extend

## What Ships

- **Authentication** - Better Auth with database sessions, email/password, magic link, Google, and GitHub OAuth. Account linking, session management, email verification, and soft delete are already in place.
- **Stripe billing** - Checkout, customer portal, webhook handling, and billing state wired into the app instead of bolted on later.
- **Plan gating** - Capability-based feature flags and usage limits with a single source of truth in one config file.
- **Organizations** - Multi-organization support with invites, active organization switching, and role-aware access.
- **Account and admin surfaces** - Dashboard shell, settings, organization management, and admin flows that already feel like a real product.
- **AI assistant** - Org-scoped chat with tool calling, model selection, and persisted conversations in the database.
- **Tasks example feature** - A full CRUD feature with TanStack Table, filters, bulk actions, server actions, and Zod validation to show how new features should fit into the app.
- **Email** - Resend integration with React Email templates for auth emails and team invitations.
- **Docs** - Local guides for setup, billing, deployment, feature extension, and assistant integration.

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
| Tables     | TanStack React Table v8             |
| Validation | Zod                                 |
| Testing    | Vitest                              |

## Deploy to Vercel

Click the button to clone the repo to your GitHub, provision a Postgres database via the Neon integration, and deploy a demo instance in about two minutes:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgabrielnadoncanada%2Fsaas-starter&project-name=saas-starter&repository-name=saas-starter&env=AUTH_SECRET&envDescription=A%2032-byte%20random%20string.%20Generate%20one%20with%3A%20openssl%20rand%20-base64%2032&envLink=https%3A%2F%2Fgithub.com%2Fgabrielnadoncanada%2Fsaas-starter%2Fblob%2Fmaster%2F.env.example&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

The demo deploy runs with auth and dashboard enabled. Stripe billing, email, OAuth, and Sentry stay off until you add their keys in the Vercel dashboard — see [Deployment](/docs/deployment) for the full production checklist.

### Public demo mode

To run a public demo instance that prospects can try without breaking it, set these in your Vercel project:

- `DEMO_MODE=true` — shows a banner and blocks destructive actions (account/org/plan/member deletion, bulk task delete, admin user/org deletion). Plan selection stays open so visitors can explore plan gating; Stripe is skipped and a fake active subscription is written directly to the DB.
- `CRON_SECRET=<random>` — authorizes the daily DB reset. Vercel Cron hits `/api/demo/reset` every day at 04:00 UTC (see `vercel.json`), wiping and re-seeding the database.

## Quick start (local)

Interactive setup:

```bash
pnpm install
pnpm setup
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm setup` walks you through every required and optional env var and writes `.env` for you.

Manual setup:

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Seeded local accounts:

- `demo@starter.local` / `demo123`
- `admin@admin.com` / `admin123`

## Environment setup

Copy `.env.example` and configure:

| Variable                                    | Purpose                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `POSTGRES_URL`                              | PostgreSQL connection string                                                         |
| `AUTH_SECRET`                               | Better Auth secret for signing sessions and auth tokens                              |
| `STRIPE_SECRET_KEY`                         | Stripe API key                                                                       |
| `STRIPE_WEBHOOK_SECRET`                     | Stripe webhook signature secret                                                      |
| `BASE_URL`                                  | Your app URL (`http://localhost:3000` locally)                                       |
| `RESEND_API_KEY`                            | Resend email API key (for magic links and auth email)                                |
| `EMAIL_FROM`                                | Sender address for transactional emails                                              |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional)                                                              |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional)                                                              |
| `BETTER_AUTH_API_KEY`                       | Optional API key if you enable Better Auth’s API routes                              |
| `NEXT_PUBLIC_ACCOUNT_MODE`                  | `personal-only` \| `organizations-only` (defaults to organizations-only) |
| `ALLOW_EMAIL_ACCOUNT_LINKING`               | Set `true` to link OAuth accounts by verified email                                  |
| `EMAIL_REPLY_TO`                            | Optional reply-to for transactional email                                            |

See the [Getting Started guide](/docs/getting-started) for the first-run path and the [Plans and Billing guide](/docs/plans-and-billing) for the billing flow. The authoritative list is `.env.example`.

Auth emails and organization invitation emails ship in English by default. To customize the copy, edit the React Email templates in `lib/email/templates/` and the related email subjects in `lib/auth/auth-config.ts`.

## How billing works

Plans are defined in `config/billing.config.ts`. Stripe price IDs from env select the checkout targets, and the billing config decides what each plan unlocks.

```
Stripe decides which plan is active.
Your config decides what that plan gives.
```

**To add a plan:** Create the prices in Stripe, add their `STRIPE_PRICE_*` env vars, then define capabilities, limits, and pricing behavior in `config/billing.config.ts`.

**To test billing locally:** Follow the [Plans and Billing guide](/docs/plans-and-billing) and forward Stripe webhooks to `/api/stripe/webhook`.

**To gate a feature:** Call `assertCapability(planId, "your.capability")` in your server action.

**To enforce a quota:** Call `assertLimit(planId, "yourLimit", currentUsage)` after checking usage.

Flat-rate monthly and yearly subscriptions are supported out of the box.

## Project structure

```
app/                -> Routes and layouts (thin - delegates to features)
features/           -> Product code organized by domain
  auth/             -> Sign-in, sign-up, post-sign-in, OAuth
  billing/          -> Plans, guards, checkout, webhooks, usage tracking
  assistant/        -> AI chat, tools, conversations, model selection
  tasks/            -> CRUD example with plan gating
  organizations/    -> Organization management, invitations, roles
  account/          -> Profile, settings, account deletion
components/         -> Shared UI components, layout, navigation
lib/                -> Auth, database, email, Stripe clients
hooks/              -> Reusable React hooks
config/             -> App-wide typed configuration
constants/          -> Routes, terminology
types/              -> Shared app types
prisma/             -> Schema, migrations, seed
content/docs/       -> Full documentation (Fumadocs MDX)
```

## Why This Starter

- **A real B2B base, not just scaffolding** - Teams, billing, admin, and account flows are already there, so you are not stuck rebuilding the serious parts after launch.
- **Readable by design** - Feature-organized code, thin routes, and clear boundaries. You can understand the app quickly and keep understanding it after customization.
- **Built for modification** - Billing rules, plan limits, and product structure are explicit. You can add product logic without fighting a hidden internal framework.
- **Credible from day one** - The starter already looks and behaves like a product you can demo, sell, and ship.
- **Modern defaults** - Next.js 16, React 19, Tailwind v4, TypeScript strict, Server Components, and Server Actions.

## Documentation

Focused documentation is available at `/docs` when the app is running, or browse `content/docs/` in the repo. Start with:

- [Getting Started](/docs/getting-started)
- [Customization](/docs/customization)
- [Accounts and Auth](/docs/accounts-and-auth)
- [Plans and Billing](/docs/plans-and-billing)
- [Development](/docs/development)
- [Deployment](/docs/deployment)
- [Assistant tool integration](features/assistant/TOOL_INTEGRATION.md)

## Scripts

| Command           | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `pnpm dev`        | Start dev server with Turbopack                            |
| `pnpm build`      | Production build                                           |
| `pnpm test`       | Run tests                                                  |
| `pnpm test:watch` | Tests in watch mode                                        |
| `pnpm db:migrate` | Run database migrations                                    |
| `pnpm db:seed`    | Seed demo data                                             |
| `pnpm db:studio`  | Open Prisma Studio                                         |
| `pnpm email:dev`  | Preview email templates                                    |

## License

This software is proprietary and licensed under the [Tenviq Commercial License](LICENSE). You may use it to build unlimited end-products, but you may not redistribute, resell, or share the source code. See the LICENSE file for full terms.
