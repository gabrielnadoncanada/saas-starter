# SaaS Starter

Next.js SaaS boilerplate with multi-tenant organizations, billing, AI assistant, and admin panel.

## Tech Stack

- Framework: Next.js 16 (App Router, Turbopack)
- Language: TypeScript (strict)
- Database: PostgreSQL with Prisma ORM (multi-file schema in `prisma/models/`)
- Auth: better-auth (config in `shared/lib/auth/`)
- Payments: Stripe via @better-auth/stripe
- AI: Vercel AI SDK with Google, OpenAI, Groq providers
- UI: shadcn/ui (Radix), Tailwind CSS v4, ai-elements
- Forms: react-hook-form + zod
- Email: Resend + react-email
- Testing: Vitest
- Package manager: pnpm

## Project Structure

```
app/
  (app)/          → authenticated app routes (dashboard, admin, settings)
  (auth)/         → auth pages (sign-in, sign-up, forgot-password, etc.)
  (marketing)/    → public marketing pages
  api/            → API routes (assistant, auth, stripe)
features/         → feature modules, each with actions/, components/, server/, schemas/, types/
  account/        → user account management
  assistant/      → AI chatbot assistant
  auth/           → authentication logic
  billing/        → Stripe billing, plans, usage
  dashboard/      → dashboard widgets
  organizations/  → multi-tenant orgs
  settings/       → app settings
  tasks/          → task management (CRUD example)
  users/          → user management (admin)
shared/
  components/     → shared UI components (ui/, layout/)
  config/         → app-wide configuration
  constants/      → shared constants
  hooks/          → shared React hooks
  lib/            → core libraries (auth, db, email, stripe, crypto)
  styles/         → global styles
  types/          → shared type definitions
prisma/
  models/         → split schema files (auth, billing, tasks, teams, usage, assistant)
test/             → test files by feature (assistant, billing, tasks)
chatbot/          → standalone chatbot UI components
```

## Key Conventions

- Imports: absolute paths via `@/*` alias
- Feature structure: `features/<name>/` with `actions/`, `components/`, `server/`, `schemas/`, `types/`
- App routes are thin — logic lives in `features/` and `shared/`
- Prisma schema split across `prisma/models/*.prisma`
- Auth config in `shared/lib/auth/auth-config.ts`, re-exported from root `auth.ts`

## Commands

- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm test` — run tests (Vitest)
- `pnpm test:watch` — tests in watch mode
- `pnpm db:migrate` — run Prisma migrations
- `pnpm db:generate` — regenerate Prisma client
- `pnpm db:studio` — open Prisma Studio
- `pnpm db:seed` — seed database
- `pnpm db:push` — push schema without migration
- `pnpm email:dev` — preview email templates
