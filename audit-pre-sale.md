# Pre-Sale Audit — SaaS Starter

**Date**: 2026-04-03
**Auditor**: Senior Product Engineer / Buyer-Fit Auditor
**Target buyer**: Solo founders, consultants, freelancers, indie hackers, small technical teams
**Target price**: $149 one-time

---

# Executive Verdict

This is a **strong and sellable** SaaS starter. The features architecture is genuinely buyer-friendly: feature-first folders, thin app routes, shared schemas between client and server, real billing enforcement (not just Stripe webhooks, but actual capability checks and usage limits wired into mutations), a working AI assistant with tool calls, multi-tenant organizations, and a polished marketing landing page. The structure is proportionate to the problem — there is very little gratuitous abstraction, and the `ADDING_A_FEATURE.md` guide is one of the best buyer-onboarding artifacts I've seen in a starter. At $149 this competes well. There are a handful of friction points that could trip a buyer — hardcoded French strings in the billing UI, an inconsistent separation between `features/ai` and `features/assistant`, and some type-file proliferation — but none of these are dealbreakers.

---

# Buyer-Fit Scorecard

| Dimension | Score |
|---|---|
| Buyer fit | **8** |
| Time to understand | **8** |
| Time to modify | **7.5** |
| Cognitive simplicity | **7** |
| Feature credibility | **9** |
| Perceived value at $149 | **9** |
| Differentiation | **8** |
| Launch readiness | **7** |

---

# Deep Dive: Features Folder

## Structural Strengths

### 1. Feature-first layout is genuinely obvious

169 files across 16 features. Every feature owns its components, server logic, actions, and schemas. A buyer opening `features/tasks/` finds the form schema, the mutations, the server actions, the page component, and the table — all colocated. No hunting through `lib/repositories/` or `utils/handlers/`. This is exactly right for the audience.

### 2. `ADDING_A_FEATURE.md` is an exceptional buyer artifact

This file (`features/ADDING_A_FEATURE.md`) provides a 6-step minimal-CRUD recipe and a fuller task-based pattern for attachments and bulk behavior. It names exact files to copy, shows the action skeleton, explains billing gating in 4 lines, and gives the route pattern. This is the single best piece of starter documentation I've seen. It directly reduces buyer support burden and regret risk.

### 3. Proportionate file counts per feature

- `tasks`: 16 files — justified by bulk actions, table with sorting/filtering/pagination, attachments, form sheet, delete dialog. This is the "reference CRUD" and it earns its file count.
- `billing`: 22 files — justified by Stripe checkout, webhooks, portal, plan resolution, usage metering, guards, errors, pricing UI. Billing is inherently complex; the file split matches real responsibilities.
- `auth`: 21 files — OAuth, magic link, password, 2FA, sign-in/sign-up, verification, onboarding. Each file does one specific auth flow step.
- `settings`: 2 files (sidebar, nav config). Thin shell, logic lives in account/billing/organizations.

### 4. Server actions use a consistent, learnable pattern

Every mutation action follows the same shape: `validatedAuthenticatedAction(schema, async handler)`. The `validatedOrganizationOwnerAction` composition in organizations is a clean one-level wrapper. There's no handler/use-case/repository ceremony — just schema -> mutation -> revalidate -> return.

### 5. Billing gating is wired into real feature code

`task-mutations.ts:47-55` shows `assertCapability` and `consumeMonthlyUsage` called inside a transaction. This is not decorative — it's the real pattern a buyer needs, and it works at the data level, not just the UI level. The `billing.config.ts` file is a single source of truth for plans, limits, and capabilities.

### 6. Thin routes pattern is respected

`app/[locale]/(app)/dashboard/tasks/page.tsx` is 34 lines: parse search params, fetch data, render component. `app/[locale]/(app)/dashboard/page.tsx` is 10 lines. This is exactly what the buyer should see.

---

## Structural Weaknesses

### 1. `features/ai` vs `features/assistant` split is confusing

- **Severity**: medium
- **Evidence**: `features/ai/` contains organization AI settings, conversation/message CRUD, model selection, and surfaces config. `features/assistant/` contains the chat UI, tools, and conversation client requests. Both deal with "the AI feature."
- **Why it's a problem**: A buyer looking for "the AI chat" must understand which of two feature folders to edit. The `ai/` folder is really "AI infrastructure" while `assistant/` is "AI feature." This split would make sense in a larger codebase with multiple AI surfaces, but the comment in `ai-surfaces.ts` explicitly says "while there is only one assistant UI."
- **Buyer impact**: Confusion when modifying the AI assistant. Unnecessary mental model.
- **Smallest fix**: Merge `features/ai/` into `features/assistant/`. The 9 `ai/` files are all used exclusively by the assistant feature or its API route. Move them into `features/assistant/server/` with clear names.

### 2. Type files that duplicate what Zod schemas already provide

- **Severity**: low
- **Evidence**: `features/account/types/account.types.ts` defines `UpdateAccountValues`, `DeleteAccountActionState`, `LinkedAccountsActionState`, `SecuritySettingsActionState`, etc. — types that are either derived from Zod schemas or simple `FormActionState<X>` aliases. `features/organizations/types/admin-organizations.types.ts`, `membership.types.ts`, `organization.types.ts` — three separate type files.
- **Why it's a problem**: Every type file is an extra file to navigate and maintain. Many of these types are used in exactly one place. The tasks feature demonstrates a better pattern: action state types are co-located directly in `task-server-actions.ts`.
- **Buyer impact**: Navigation tax. When modifying account or organization features, the buyer must check the types file to understand shapes, instead of finding them next to the code that uses them.
- **Smallest fix**: Inline single-use type aliases next to their consumers. Keep shared view types (like `OrganizationMemberView`) in a single types file per feature only when genuinely shared across 3+ files.

### 3. `features/api/` is an empty directory

- **Severity**: low
- **Evidence**: `features/api/` has 0 files.
- **Buyer impact**: Minor confusion — is this meant to be used? Feels like scaffolding that was never cleaned up.
- **Smallest fix**: Delete it.

### 4. Organization owner action wrapper adds one more level of indirection

- **Severity**: low
- **Evidence**: `features/organizations/actions/validated-organization-owner.action.ts` wraps `validatedAuthenticatedAction` to add role checking. Used by `organization-owner.actions.ts` and `organization-admin.actions.ts`.
- **Why it's a problem**: It's a 53-line file creating a second action builder. A buyer learning the system must understand: `validatedAuthenticatedAction` (shared), then `validatedOrganizationOwnerAction` (organizations-specific). The role check is 4 lines inside the wrapper.
- **Buyer impact**: Low — it's a reasonable pattern and the code is clear. But it's the kind of thing that becomes a template if other features copy it, leading to feature-specific action wrappers multiplying.
- **Smallest fix**: Acceptable as-is. Just don't encourage copying this pattern for every feature.

---

## Overbuilt Areas

### 1. Three type files for organizations

`types/admin-organizations.types.ts`, `types/membership.types.ts`, `types/organization.types.ts` — split across 3 files. The organization feature is the most complex (25 files), and some of this is justified, but three separate type files for one feature is on the edge.

### 2. AI model selection system

`features/ai/server/resolve-model-selection.ts` + `shared/lib/ai/models.ts` + `features/ai/server/organization-ai-settings.ts` + `features/ai/schemas/organization-ai-settings.schema.ts` + `features/ai/actions/organization-ai-settings.actions.ts` + `features/ai/components/organization-ai-settings-panel.tsx`. This is 6+ files for "pick which AI model to use." For a starter with exactly 2 models (Gemini Flash and Llama 3.1 8B), this is structurally valid but commercially overbuilt. A buyer would likely just hardcode their preferred model.

---

## Risky Patterns

### 1. Hardcoded French strings in billing-plan-selector.tsx

- **Severity**: high
- **Evidence**: `features/billing/components/billing-plan-selector.tsx:115-145` — "Reserve au proprietaire", "Gerer l'abonnement dans Stripe", "Changer ce forfait dans Stripe", "Abonnement deja actif", "Proceder au paiement", etc. These are hardcoded French strings, not using `useTranslations()`.
- **Why it's critical**: The rest of the codebase uses next-intl consistently with `t()` calls. This component breaks the pattern. For an English-first buyer, this is an immediate "what happened here?" moment that erodes confidence. It suggests incomplete work.
- **Buyer impact**: Immediate confusion. The buyer sees French in their billing UI and doesn't know if this is intentional or a regression.
- **Smallest fix**: Replace hardcoded strings with `useTranslations("settings.billing")` calls, matching the pattern used everywhere else.

### 2. Empty `features/api/` folder

Already noted above. Delete it.

---

## Easiest Wins

1. **Fix French strings in billing selector** — 15 minutes, high buyer-confidence impact.
2. **Delete `features/api/`** — 1 second, removes confusion.
3. **Merge `features/ai/` into `features/assistant/`** — 30 minutes, reduces feature count from 16 to 15 and eliminates a confusing split.
4. **Inline single-use type aliases** — 1 hour across account/organizations, reduces navigation tax.

---

## Feature Groups: Easiest to Modify

- **tasks** — The reference CRUD. Schema -> mutations -> actions -> components -> route. A buyer can copy this folder and have a new feature working in under an hour.
- **dashboard** — 9 files, clear server/components split. Adding a widget = add a component, wire data in `get-dashboard-overview.ts`.

## Feature Groups: Hardest to Modify

- **organizations** — 25 files across actions/components/schemas/server/types. Justified by the complexity (invitations, members, roles, admin views, org switching, renaming). But a buyer editing invitation logic must touch 4+ files. Not overbuilt, just inherently complex.
- **billing** — 22 files. A buyer modifying Stripe behavior must understand checkout -> webhooks -> subscription sync -> plan resolution -> guards -> usage. This is real Stripe complexity, not gratuitous structure.
- **auth** — 21 files. Auth is inherently complex: multiple auth methods, 2FA, verification, onboarding. The split across OAuth/password/session/sign-in/sign-up subdirectories is navigable but requires understanding the flow.

---

## File-Count / Indirection / Navigation Problems

Generally well-controlled. The biggest offender is organizations at 25 files, but each file does something distinct. The 169-file total across 16 features averages ~10.5 files per feature, which is reasonable.

The one indirection that adds real cost is `ai/` <-> `assistant/` — a buyer tracing the AI chat flow must jump between two feature folders plus the API route. This is the most confusing import graph in the codebase.

---

## Naming Problems

- `features/files/` — only contains `server/storage-service.ts`. The name "files" is too generic. Consider `storage`.
- `task-server-actions.ts` vs `task-mutations.ts` — the naming convention is clear once you read the guide, but "mutations" vs "server-actions" could confuse a buyer who hasn't read the guide yet.
- `validated-organization-owner.action.ts` — the `.action.ts` suffix is used inconsistently. Some files use it, some don't.

---

## Candidate Merges or Simplifications

| Target | Action | Reason |
|---|---|---|
| `features/ai/` -> `features/assistant/` | Merge entirely | One product feature split across two folders |
| `features/api/` | Delete (empty) | Zero files, dead scaffolding |
| `features/account/types/account.types.ts` | Inline types into their consumers | Most types used in 1-2 places |
| `features/organizations/types/*.ts` (3 files) | Consider merging to 1-2 files | Three type files for one feature |
| `features/files/` | Rename to `features/storage/` | "files" is too generic |

---

# Top 10 Problems in the Repo

### 1. Hardcoded French strings in billing plan selector

- **Severity**: critical
- **Category**: i18n consistency / buyer confidence
- **Evidence**: `features/billing/components/billing-plan-selector.tsx:115-145` — "Reserve au proprietaire", "Gerer l'abonnement dans Stripe", etc.
- **Buyer impact**: Immediate erosion of trust. Buyer sees mixed languages in a core billing screen.
- **Smallest fix**: Use `useTranslations("settings.billing")` for all strings.

### 2. `features/ai/` and `features/assistant/` split

- **Severity**: medium
- **Category**: feature boundary confusion
- **Evidence**: Two feature folders for one product feature (AI chat). `ai-surfaces.ts` admits "while there is only one assistant UI."
- **Buyer impact**: Confusion tracing AI flows; unnecessary mental model.
- **Smallest fix**: Merge `features/ai/` into `features/assistant/`.

### 3. No `.env.example` documentation for all required variables

- **Severity**: medium
- **Category**: launch readiness
- **Evidence**: `.env.example` exists but Stripe price IDs are referenced conditionally via `process.env.STRIPE_PRICE_PRO_MONTHLY` etc. in `billing.config.ts`. A buyer must reverse-engineer which env vars are required for billing to work.
- **Buyer impact**: Setup friction. Billing silently degrades to empty plans if env vars are missing.
- **Smallest fix**: Add clear comments in `.env.example` grouping all Stripe env vars with descriptions.

### 4. Empty `features/api/` directory

- **Severity**: low
- **Category**: dead code / clutter
- **Evidence**: 0 files in the directory.
- **Buyer impact**: Minor confusion.
- **Smallest fix**: Delete.

### 5. No error boundary in settings pages

- **Severity**: low-medium
- **Category**: robustness
- **Evidence**: `app/[locale]/(app)/settings/error.tsx` exists, but `settings/billing/page.tsx` does `redirectToLocale(locale, routes.auth.login)` without `return` — the `redirectToLocale` must throw, but if better-auth is misconfigured, the page crashes with an unhandled error.
- **Buyer impact**: Confusing error if auth/org is not set up correctly during development.
- **Smallest fix**: Acceptable as-is if `redirectToLocale` throws (which it likely does via Next.js redirect). Low priority.

### 6. Inconsistent action file naming convention

- **Severity**: low
- **Category**: naming consistency
- **Evidence**: `checkout.action.ts`, `customer-portal.action.ts` (billing) vs `task-server-actions.ts` (tasks) vs `organization-owner.actions.ts` (organizations). Some use `.action.ts`, some `.actions.ts`, some `-server-actions.ts`.
- **Buyer impact**: Minor pattern confusion when creating new features.
- **Smallest fix**: Standardize to one convention (e.g., `*.actions.ts`).

### 7. `features/marketing/` hardcodes navigation links

- **Severity**: low
- **Category**: maintenance
- **Evidence**: `marketing-header.tsx:9-15` hardcodes `navLinks` instead of using `routes` constant or i18n.
- **Buyer impact**: Buyer must update links in two places if they rename routes.
- **Smallest fix**: Use anchor links referencing `routes` where applicable.

### 8. Dashboard overview fetches all tasks to count them

- **Severity**: medium
- **Category**: performance
- **Evidence**: `get-dashboard-overview.ts:42` calls `listTasks()` which does `db.task.findMany()` with no pagination, then uses `tasks.length` for the count and `tasks.slice(0, 5)` for recent tasks.
- **Buyer impact**: Performance degrades as task count grows. This is fine for demos but would become a problem for real production use.
- **Smallest fix**: Use `db.task.count()` for the total and a separate `findMany({ take: 5 })` for recent tasks.

### 9. Test coverage is good but not feature-complete

- **Severity**: low
- **Category**: quality assurance
- **Evidence**: 19 test files covering billing, tasks, auth, assistant, AI, organizations, files. Missing tests for: account deletion, admin actions, organization invitations.
- **Buyer impact**: Buyer must write tests for features they modify. Acceptable for a starter, but slightly below expectations at $149.
- **Smallest fix**: Add 3-4 more test files for the missing critical paths.

### 10. Two i18n message file sets (en + fr) but French is likely incomplete

- **Severity**: low
- **Category**: i18n completeness
- **Evidence**: `shared/i18n/messages/fr/` exists with all JSON files. Combined with the hardcoded French in `billing-plan-selector.tsx`, this suggests i18n may be partially done.
- **Buyer impact**: A buyer targeting English-only markets must decide whether to strip French or maintain it.
- **Smallest fix**: Verify French translations are complete; if not, document which sections need work.

---

# Overbuilt or Too Sophisticated Areas

1. **AI model selection system** — 6+ files for choosing between 2 hardcoded models. Organization-level settings, allowed model lists, default model config, and a settings panel — all for a feature most buyers will simplify to one model.

2. **Three organization type files** — `admin-organizations.types.ts`, `membership.types.ts`, `organization.types.ts`. Valid structure, but for a starter, 1-2 type files would suffice.

3. **AI conversation persistence** — Full CRUD for AI conversations with surface-based namespacing (`ai-surfaces.ts`). The infrastructure supports multiple chat surfaces, but there's only one. Justified if you're demonstrating the pattern; overbuilt if the buyer just wants a chatbot.

4. **`RefreshableFormState` type** — A type alias that adds `refreshKey?: number` to `FormActionState`. Used in organizations for revalidation. It's a 4-line type in its own concept, but it's really just "FormActionState plus a refresh counter." Could be inlined.

---

# Strong / Sellable Areas

1. **Billing enforcement (guards + usage metering)** — This is the differentiator. `assertCapability()`, `consumeMonthlyUsage()`, and `checkLimit()` are dead-simple APIs with real transactional enforcement. Two lines to gate a feature. This is what buyers are paying for.

2. **`billing.config.ts` as a single source of truth** — Plans, capabilities, limits, prices, all in one file. Type-safe. Buyer can add a plan in 20 lines.

3. **`ADDING_A_FEATURE.md`** — Best onboarding artifact possible. Minimal recipe + full recipe + billing integration + route pattern + test pattern. This alone reduces support burden significantly.

4. **Task feature as a reference CRUD** — Complete with sorting, filtering, pagination, bulk actions, form validation, attachments, and billing gating. A buyer copies this and has a production-ready feature.

5. **AI assistant with tool calls** — Working chat with real tools (create task, review inbox, draft invoice). Demonstrates billing-gated AI with usage limits. This is a strong selling point.

6. **Marketing landing page** — Feature grid, screenshots gallery, comparison section, pricing toggle, FAQ, builder section. This isn't a placeholder — it's a full sales page.

7. **Multi-tenant organizations** — Org switching, member management, invitations with email, role-based access. Not a toy implementation.

8. **Auth completeness** — Email/password, OAuth, magic link, 2FA, email verification, password reset, admin impersonation. Real auth, not a demo.

9. **Stripe webhook handling** — Handles checkout.completed, subscription CRUD, customer.deleted, invoice.payment_failed, trial_will_end. Real production Stripe code.

10. **Dashboard with real data** — Usage meters, activity chart, onboarding checklist, recent tasks, plan info. Not lorem ipsum.

---

# Missing or Weak Features

1. **No RBAC beyond owner/member** — `requireActiveOrganizationRole(["owner"])` is the only role check. No custom roles or fine-grained permissions. Acceptable for the audience, but a buyer building a B2B product will outgrow this quickly.

2. **No real email integration for inbox** — `assistantDemoInbox` is explicitly a demo with TODO comments. The inbox review tool shows fake data. The code is honest about this, but it reduces the "production-ready" perception.

3. **No onboarding flow** — `features/auth/server/onboarding.ts` exists but there's no guided onboarding UI beyond the dashboard checklist. A buyer would need to build their own welcome wizard.

4. **No admin dashboard metrics** — `get-admin-overview-stats.ts` returns 4 numbers (total users, active, banned, total orgs). No charts, no revenue metrics, no growth data.

5. **No export functionality** — `task.export` capability is defined in billing but no export implementation exists.

6. **No Stripe customer portal customization** — Portal session is created with minimal config. No custom flow items.

7. **No rate limiting on API routes** — `app/api/assistant/route.ts` validates payload size and checks billing limits but has no IP-level or user-level rate limiting.

---

# Highest ROI Fixes

### 1. Fix French strings in billing plan selector

- **What**: Replace hardcoded French with `useTranslations()` calls
- **Why**: Immediate buyer confidence hit; inconsistent with rest of codebase
- **Impact**: High — removes the single most jarring quality signal
- **Size**: Small (15 minutes)

### 2. Fix dashboard performance (listTasks fetches all)

- **What**: Replace `listTasks()` with `db.task.count()` + `findMany({ take: 5 })`
- **Why**: Current implementation fetches ALL tasks to count them and show 5
- **Impact**: Medium — prevents a production gotcha; shows the starter handles scale
- **Size**: Small (20 minutes)

### 3. Merge features/ai into features/assistant

- **What**: Move all `features/ai/` files into `features/assistant/server/` or `features/assistant/`
- **Why**: Eliminates confusing split between two feature folders for one product feature
- **Impact**: Medium — simplifies mental model, reduces feature count
- **Size**: Medium (30-60 minutes, updating imports)

### 4. Standardize action file naming

- **What**: Rename all action files to use consistent `*.actions.ts` suffix
- **Why**: Reduces "which convention?" friction for new features
- **Impact**: Low-medium — consistency signal
- **Size**: Small (15 minutes)

### 5. Add `.env.example` documentation for billing env vars

- **What**: Group and document all Stripe-related env vars with descriptions
- **Why**: Billing silently degrades if env vars are missing; buyer must reverse-engineer requirements
- **Impact**: Medium — reduces setup friction significantly
- **Size**: Small (15 minutes)

---

# File-Level Simplification Targets

| Path | Action | Reason |
|---|---|---|
| `features/api/` | **Delete** | Empty directory |
| `features/ai/` -> `features/assistant/` | **Merge** | One product feature split across two folders |
| `features/ai/ai-surfaces.ts` | **Inline** into assistant constants | 7-line file for a single constant |
| `features/account/types/account.types.ts` | **Inline** types into consumers | Most types used in 1-2 places |
| `features/organizations/types/*.ts` (3 files) | **Merge** into 1 file | Three type files for one feature |
| `features/files/` | **Rename** to `features/storage/` | "files" is too generic |
| `features/billing/components/billing-plan-selector.tsx` | **Fix i18n** | Hardcoded French strings |
| `features/dashboard/server/get-dashboard-overview.ts` | **Fix** `listTasks()` call | Performance issue |

---

# Final Recommendation

**Near ready, polish and document.**

The core architecture is excellent. The billing enforcement pattern is genuinely differentiating. The feature folder structure is proportionate and buyer-friendly. The `ADDING_A_FEATURE.md` guide is best-in-class. The task reference CRUD, AI assistant, and marketing page are all high-value assets.

The blockers before selling are small:

1. Fix the French strings in the billing UI (15 min) — this is the only thing that could make a buyer think the code is unfinished
2. Fix the `listTasks` performance issue in the dashboard (20 min) — a production gotcha hiding in a demo-safe spot
3. Optionally merge `ai/` into `assistant/` for cleaner feature boundaries

After those fixes, this starter is ready to sell at $149. The billing gating system, working AI assistant with tools, multi-tenant orgs, and the quality of the reference CRUD make this a strong offering against competitors that just wire up Stripe webhooks and stop.
