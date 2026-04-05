# SaaS Starter

A production-ready Next.js SaaS starter with authentication, Stripe billing, plan gating, organization management, and a polished dashboard built for technical founders and small teams who want to ship fast.

## Who is this for

- Solo founders launching a SaaS product
- Small technical teams who don't want to rebuild auth + billing + organizations from scratch
- Freelancers and agencies starting client projects from a strong base

## What's included

- **Authentication** - Better Auth with database sessions, email/password, magic link, Google, and GitHub OAuth. Account linking, session management, and soft delete built in.
- **Stripe billing** - Subscriptions (flat and per-seat), one-time payments, checkout, customer portal, and webhook handling.
- **Plan gating** - Capability-based feature flags and usage limits (monthly quotas, team member caps). Single source of truth in one config file.
- **Organization management** - Multi-organization support with roles (Owner, Admin, Member), invitations, and active organization switching.
- **Dashboard shell** - Sidebar navigation, command menu, theme switching, responsive layout, and settings pages.
- **AI assistant** - Org-scoped chat with tool calling (e.g. task creation), model selection, and conversations stored in the database.
- **Tasks CRUD example** - Full working feature with TanStack Table (sort, filter, paginate, bulk actions), server actions, Zod validation, and plan-gated creation.
- **Email** - Resend integration with React Email templates for auth emails and team invitations.
- **Starter docs** - Local guides for environment setup, adding a feature, testing, and extending assistant tools.

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

Seeded local accounts:

- `demo@starter.local` / `demo123`
- `admin@admin.com` / `admin123`

## Environment setup

Copy `.env.example` and configure:

| Variable                                    | Purpose                                                 |
| ------------------------------------------- | ------------------------------------------------------- |
| `POSTGRES_URL`                              | PostgreSQL connection string                            |
| `AUTH_SECRET`                               | Better Auth secret for signing sessions and auth tokens |
| `STRIPE_SECRET_KEY`                         | Stripe API key                                          |
| `STRIPE_WEBHOOK_SECRET`                     | Stripe webhook signature secret                         |
| `BASE_URL`                                  | Your app URL (`http://localhost:3000` locally)          |
| `RESEND_API_KEY`                            | Resend email API key (for magic links and auth email)   |
| `EMAIL_FROM`                                | Sender address for transactional emails                 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional)                                 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional)                                 |
| `BETTER_AUTH_API_KEY`                       | Optional API key if you enable Better Auth’s API routes |
| `NEXT_PUBLIC_ACCOUNT_MODE`                  | `personal-only` \| `organizations-only` \| `hybrid` (defaults to organizations-only) |
| `ALLOW_EMAIL_ACCOUNT_LINKING`             | Set `true` to link OAuth accounts by verified email     |
| `EMAIL_REPLY_TO`                            | Optional reply-to for transactional email               |

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for the full checklist (including Stripe price IDs) and [docs/STRIPE_TEST_MODE_SETUP.md](docs/STRIPE_TEST_MODE_SETUP.md) for the billing flow. The authoritative list is `.env.example`.

Auth emails and organization invitation emails ship in English by default. To customize the copy, edit the React Email templates in `shared/lib/email/templates/` and the related email subjects in `shared/lib/auth/auth-config.ts`.

## How billing works

Plans are defined in `shared/config/billing.config.ts`. Stripe price IDs from env select the checkout targets, and the billing config decides what each plan unlocks.

```
Stripe decides which plan is active.
Your config decides what that plan gives.
```

**To add a plan:** Create the prices in Stripe, add their `STRIPE_PRICE_*` env vars, then define capabilities, limits, and pricing behavior in `shared/config/billing.config.ts`.

**To test billing locally:** Follow [docs/STRIPE_TEST_MODE_SETUP.md](docs/STRIPE_TEST_MODE_SETUP.md) and forward Stripe webhooks to `/api/stripe/webhook`.

**To gate a feature:** Call `assertCapability(planId, "your.capability")` in your server action.

**To enforce a quota:** Call `assertLimit(planId, "yourLimit", currentUsage)` after checking usage.

Three pricing models are supported out of the box: flat-rate subscriptions, per-seat billing, and one-time payments.

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
shared/             -> Cross-feature infrastructure
  components/       -> UI components, layout, navigation
  lib/              -> Auth, database, email, Stripe clients
  hooks/            -> Reusable React hooks
  constants/        -> Routes, terminology
prisma/             -> Schema, migrations, seed
docs/               -> Setup, customization, and reference guides
```

## Why this starter

- **Launch faster** - Auth, billing, organizations, and a dashboard shell are already wired together. Start building your product features on day one.
- **Understand quickly** - Feature-organized code, thin routes, and short files. No custom frameworks to learn.
- **Modify safely** - Plan gating and usage limits are centralized. Adding a new gated feature is a two-line change.
- **Customize freely** - The repo includes focused docs for environment setup, feature creation, testing, and extending assistant tools.
- **Modern defaults** - Next.js 16, React 19, Tailwind v4, TypeScript strict, Server Components, Server Actions.

## Documentation

Core documentation lives in this repo:

- [Environment setup](docs/ENVIRONMENT_SETUP.md)
- [Stripe test mode setup](docs/STRIPE_TEST_MODE_SETUP.md)
- [Adding a feature](features/ADDING_A_FEATURE.md)
- [Testing a feature](docs/TESTING_A_FEATURE.md)
- [Assistant tool integration](features/assistant/TOOL_INTEGRATION.md)

## Scripts

| Command           | Purpose                         |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start dev server with Turbopack |
| `pnpm build`      | Production build                |
| `pnpm test`       | Run tests                       |
| `pnpm test:watch` | Tests in watch mode             |
| `pnpm db:migrate` | Run database migrations         |
| `pnpm db:seed`    | Seed demo data                  |
| `pnpm db:studio`  | Open Prisma Studio              |
| `pnpm email:dev`  | Preview email templates         |

## License

MIT
