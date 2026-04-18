# SaaS Starter

Next.js SaaS boilerplate with multi-tenant organizations, billing, AI assistant, and admin panel.

## Tech Stack

- Framework: Next.js 16 (App Router, Turbopack)
- Language: TypeScript (strict)
- Database: PostgreSQL with Prisma ORM (multi-file schema in `prisma/models/`)
- Auth: better-auth (config in `lib/auth/`)
- Payments: Stripe via @better-auth/stripe
- AI: Vercel AI SDK with Google, OpenAI, Groq providers
- UI: shadcn/ui (Radix), Tailwind CSS v4, ai-elements
- Forms: useActionState + server actions + zod
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
  tasks/          → task management (CRUD example)
  users/          → user management (admin)
components/       → shared UI components (ui/, layout/, navigation/)
config/           → app-wide configuration
constants/        → shared constants
hooks/            → shared React hooks
lib/              → core libraries (auth, db, email, stripe, crypto)
types/            → shared type definitions
prisma/
  models/         → split schema files (auth, billing, tasks, teams, usage, assistant)
test/             → test files by feature (assistant, billing, tasks)
```

## Key Conventions

- Imports: absolute paths via `@/*` alias
- Feature structure: `features/<name>/` with `actions/`, `components/`, `server/`, `schemas/`, `types/`
- App routes are thin — logic lives in `features/`, `components/`, `lib/`, and other root app folders
- Prisma schema split across `prisma/models/*.prisma`
- Auth config in `lib/auth/auth-config.ts`, re-exported from root `auth.ts`

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

## Public Chat Platform

Multi-tenant embeddable chat for customer-facing sites. Customers install a
single `<script src="/widget.js">` tag; each organization can run multiple
agents (slugged, versioned prompt, own knowledge base, own inbox).

### Required env vars

- `GOOGLE_GENERATIVE_AI_API_KEY` or `GROQ_API_KEY` — at least one LLM
  provider for streaming answers and judging evals
- `OPENAI_API_KEY` — embeddings (text-embedding-3-small) for RAG and
  correction retrieval; features degrade gracefully if absent
- `COHERE_API_KEY` (optional) — reranks retrieved chunks (rerank-multilingual-v3.0)
- `PUBLIC_CHAT_ALLOWED_ORIGINS` — comma-separated CORS allow-list for
  customer sites; `*` is allowed in dev but unsafe with credentials

### Module layout

```
features/agents/           → prompts, versions, tools, conversations, evals, corrections
features/knowledge/        → document ingest, chunking, retrieval, reranking (pgvector)
features/leads/            → lead capture from conversation
app/api/public-chat/       → chat stream, bootstrap, feedback endpoints (CORS-enabled)
app/embed/[org]/[agent]/   → iframe-loaded chat page (CSP: frame-ancestors *)
public/widget.js           → vanilla JS loader + launcher injected on customer sites
prisma/models/agents.prisma, knowledge.prisma → Agent, AgentVersion,
  PublicConversation, Lead, MessageFeedback, Correction, KnowledgeDocument,
  KnowledgeChunk, EvalCase, EvalRun, EvalResult
```

### Key flows

- **Visitor identity** — opaque `pc_visitor` cookie (HttpOnly, Secure,
  SameSite=None, 1 year). Issued server-side on first request; lets a
  visitor resume the same conversation across tabs and sessions.
- **Prompt versioning** — every agent has N `AgentVersion` rows; exactly
  one is active. Drafting a new version is non-destructive; activating
  swaps atomically. Conversations record which version answered them.
- **RAG** — uploaded files are chunked, embedded, ivfflat-indexed. The
  `lookupKnowledge` tool does vector search scoped to the agent, then
  optionally reranks via Cohere. Always use this tool to answer facts.
- **Human handoff** — `requestHuman`/`scheduleCallback` tools flip the
  conversation to `WAITING_HUMAN`. Admin can take over (`HUMAN`,
  blocks the bot), reply inline, hand back, or resolve.
- **Correction loop** — admin edits any assistant reply in the inbox to
  create a `Correction`. The trigger user message is embedded and stored;
  on subsequent chats, similar corrections are retrieved and injected as
  few-shot examples in the system prompt.
- **Evals** — per-agent golden dataset (`EvalCase`). Runner calls
  `generateText` with the active version against each case, then scores
  via LLM-as-judge (`generateObject` with score/passed/reasoning). Writes
  `EvalResult` rows and stamps `AgentVersion.evalScore`.

### Tenant scope

Public chat resolves the agent via `runAsAdmin` (no user session on the
visitor side) and then writes through `runInTenantScope(organizationId)`
so the tenant-scope extension validates every subsequent write. Admin
flows go through `requireActiveOrganizationMembership`.
