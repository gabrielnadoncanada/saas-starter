# SaaS Starter — Deep Audit Report

> Audit date: 2026-04-01
> Auditor perspective: ruthless senior product engineer, buyer-fit auditor
> Target buyer: solo founders, consultants, freelancers, indie hackers, small technical teams
> Target price point: $149–$299

---

## Table of Contents

- [Executive Verdict](#executive-verdict)
- [Buyer-Fit Scorecard](#buyer-fit-scorecard)
- [Deep Dive: Features Folder](#deep-dive-features-folder)
  - [Structural Strengths](#structural-strengths)
  - [Structural Weaknesses](#structural-weaknesses)
  - [Overbuilt Areas (Features)](#overbuilt-areas-features)
  - [Risky Patterns](#risky-patterns)
  - [Easiest Wins](#easiest-wins)
  - [Feature Groups: Hardest to Modify](#feature-groups-hardest-to-modify)
  - [Feature Groups: Easiest to Modify](#feature-groups-easiest-to-modify)
  - [File-Count / Indirection / Navigation Problems](#file-count--indirection--navigation-problems)
  - [Naming Problems](#naming-problems)
  - [Candidate Merges or Simplifications](#candidate-merges-or-simplifications)
- [Top 10 Problems in the Repo](#top-10-problems-in-the-repo)
- [Overbuilt or Too Sophisticated Areas](#overbuilt-or-too-sophisticated-areas)
- [Strong / Sellable Areas](#strong--sellable-areas)
- [Missing or Weak Features](#missing-or-weak-features)
- [Highest ROI Fixes](#highest-roi-fixes)
- [File-Level Simplification Targets](#file-level-simplification-targets)
- [Final Recommendation](#final-recommendation)

---

## Executive Verdict

This is a **strong and sellable** Next.js SaaS starter. The feature architecture is genuinely feature-first, with proportionate structure that earns its complexity. Billing with real plan gating and usage limits is the standout differentiator — most starters fake this or leave it as boilerplate. The tasks feature serves as a proper CRUD template showing billing integration, multi-tenancy, and bulk operations. The AI assistant with tool-calling, streaming, and per-org model settings is a genuine value-add. At $149–$299, this is a confident purchase for a technical indie founder. The main risks are: a few areas where org context layering creates confusion, the auth form split is slightly verbose, and documentation for "how to add your first feature" is absent. These are polish issues, not structural ones. **Sellable with minor fixes.**

---

## Buyer-Fit Scorecard

| Dimension                        | Score | Notes                                                                                       |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| **Buyer fit**                    | 8/10  | Built for solo/small-team builders. Feature-first, not framework-first.                     |
| **Time to understand**           | 7/10  | Clear structure, but org context and auth multi-step require tracing.                       |
| **Time to modify**               | 8/10  | Tasks pattern is copy-paste-able. Billing gating is 2–3 lines to add.                      |
| **Cognitive simplicity**         | 7/10  | Low ceremony overall. Org server files and ai/assistant split add mild friction.            |
| **Feature credibility**          | 9/10  | Auth, billing, plan gating, usage limits, teams, AI assistant, admin panel — all real.      |
| **Perceived value at target price** | 9/10  | At $149–$299 this looks impressive. Billing + AI + admin + teams is substantial.           |
| **Differentiation**              | 8/10  | Plan gating as a first-class concept (assertCapability, consumeMonthlyUsage) is rare.       |
| **Launch readiness**             | 7/10  | Needs: screenshot images, builder bio, env docs, and a "how to add a feature" guide.       |

---

## Deep Dive: Features Folder

### Codebase Stats

| Area     | Files | LOC    |
| -------- | ----- | ------ |
| features | 148   | 13,502 |
| shared   | —     | 10,449 |
| app      | —     | 2,425  |
| test     | 15    | 1,517  |

| Feature       | Files | Assessment                                         |
| ------------- | ----- | -------------------------------------------------- |
| tasks         | 14    | Proportionate. Full CRUD with bulk ops + table.    |
| billing       | 23    | Proportionate. Stripe integration requires this.   |
| organizations | 22    | Slightly high. 8 server files could be 6.          |
| auth          | 21    | Slightly high. 12 form components could be 9.      |
| assistant     | 15    | Proportionate. Chat UI with tools, sidebar, model. |
| ai            | 10    | Justified if multi-surface planned. Else mergeable. |
| account       | 14    | Clean. Every file earns its place.                 |
| marketing     | 11    | Clean. All presentation.                           |
| users         | 8     | Clean.                                             |
| admin         | 5     | Lean.                                              |
| dashboard     | 3     | Lean.                                              |
| settings      | 2     | Correct. Navigation config only.                   |

---

### Structural Strengths

#### 1. Feature-first organization is genuine, not decorative

Every feature directory owns its full vertical slice: components, server logic, actions, schemas, types. There are no leaky `services/` or `repositories/` technical buckets. A buyer looking at the sidebar can mentally map features to business domains.

#### 2. The tasks feature is an excellent CRUD template

`features/tasks/` (14 files, ~1,774 LOC) demonstrates: Zod validation, server actions with auth, Prisma mutations with org-scoping, billing capability checks, usage consumption, bulk operations, and a professional data table with filtering/sorting/pagination. This is the feature buyers will clone, and it's production-quality.

**Evidence**: `features/tasks/server/task-mutations.ts:46-101` — `createTaskForCurrentOrganization` shows billing integration (`assertCapability` + `consumeMonthlyUsage`), auto-incrementing codes with retry logic, and transactional safety. This is not toy CRUD.

**Task creation flow** (files to read in order):

1. `app/(app)/dashboard/tasks/page.tsx` — entry point, fetches data (31 lines)
2. `features/tasks/components/tasks-page.tsx` — manages dialog state (127 lines)
3. `features/tasks/components/task-form-sheet.tsx` — wires form to server action (108 lines)
4. `features/tasks/components/task-form.tsx` — form UI with 5 fields (218 lines)
5. `features/tasks/server/task-server-actions.ts` — server action orchestration (158 lines)
6. `features/tasks/server/task-mutations.ts` — database write + billing checks (200 lines)
7. `features/tasks/task-form.schema.ts` — validation (72 lines)
8. `features/tasks/task-options.ts` — configuration (71 lines)

**To add a new field to tasks** (e.g., `estimate: number`), files to modify:

1. Prisma schema (not in feature directory)
2. `task-form.schema.ts` — add estimateSchema
3. `task-form.tsx` — add Field component
4. `tasks-table-columns.tsx` — add column definition
5. `task-mutations.ts` — add estimate to create/update data
6. `task-options.ts` — if predefined options needed

**Minimum: 5 files. A solo dev needs 15–20 minutes to understand this feature.**

#### 3. Billing gating is a first-class pattern, not an afterthought

Adding plan gating to any feature is 2–3 lines:

```ts
assertCapability(plan.planId, "task.create");
await consumeMonthlyUsage(orgId, "tasksPerMonth", plan.planId);
```

This is config-driven from `shared/config/billing.config.ts`. Capabilities and limits are typed. The `checkLimit()` non-throwing variant exists for UI-friendly usage displays. **This is the strongest selling point of the starter.**

**To gate a new feature:**

1. Add capability in `billing.config.ts`:
   ```ts
   export const capabilities = [
     // ... existing
     "custom.reports", // NEW
   ] as const;
   ```
2. Assign to plans in the same file.
3. Guard in server action:
   ```ts
   assertCapability(org.planId, "custom.reports");
   ```
4. UI shows upgrade card automatically via `UpgradeRequiredError`.

**To add a new plan:**

1. Add to `billingConfig.plans` array with id, name, capabilities, limits.
2. Add Stripe price IDs to `.env`.
3. All downstream logic (pricing page, settings, checkout) automatically includes the plan.
4. Total time: 10–15 minutes.

#### 4. Server actions are thin and consistent

Every feature uses the same `validatedAuthenticatedAction` wrapper (`shared/lib/auth/authenticated-action.ts`, 49 lines). Actions validate schema, check auth, delegate to mutations, and call `revalidatePath`. No variation, no surprises. A buyer learns the pattern once and applies it everywhere.

**Pattern:**

```ts
export const createTaskAction = validatedAuthenticatedAction(
  createTaskSchema,
  async (data) => {
    const task = await createTaskForCurrentOrganization(data);
    revalidatePath(routes.app.tasks);
    return { success: "Task created", task };
  },
);
```

#### 5. Naming is predictable across features

Pattern: `{feature}/actions/{name}.action.ts`, `{feature}/server/{name}.ts`, `{feature}/components/{name}.tsx`, `{feature}/schemas/{name}.schema.ts`. Consistent enough to navigate by convention without documentation.

#### 6. Route pages are correctly thin

`app/(app)/dashboard/tasks/page.tsx` (31 lines) does only: parse search params, fetch data, render feature component. Business logic lives in features. This is the correct Next.js pattern.

#### 7. Billing config is fully config-driven

`shared/config/billing.config.ts` (230 lines) defines everything: 3 plans (free, pro, team), capabilities, limits, Stripe price IDs from env vars, pricing model, trial days. Helper functions (`getPlan`, `isPlanId`, `findPlanPriceByPriceId`) are clean and focused.

**Strengths of the billing system:**

- Config-driven entire system — no hardcoded prices/features
- Clean Stripe integration — follows best practices, single webhook entry
- Type-safe feature gating — impossible to gate non-existent features
- Atomic usage tracking — correct handling of concurrent requests
- Pragmatic abstractions — no over-engineering, clear module boundaries
- Per-seat billing support — built in, not bolted on
- Trial support — configurable per price
- Portal integration — users can upgrade/downgrade without touching code

#### 8. Stripe webhook handling is robust

Two files, both necessary:

- `app/api/stripe/webhook/route.ts` (38 lines) — HTTP entry point, validates signature
- `features/billing/server/stripe/stripe-webhooks.ts` (178 lines) — event dispatcher

Handles: checkout.session.completed, customer.subscription.* (created/updated/deleted), customer.deleted, invoice.payment_failed, trial_will_end. Subscription sync uses upsert for retry safety.

#### 9. Dashboard page has real content

`app/(app)/dashboard/page.tsx` (186 lines) shows: plan status card with price, task count with usage meter, member count, AI usage meter (conditional on capability), upgrade prompts for missing capabilities, and quick action buttons. Not a placeholder.

#### 10. Marketing landing page is production-quality

11 components with: hero section, code proof sections (actual plan gating patterns), feature grid, comparison table, screenshots gallery, 3-tier pricing, 12-question FAQ, builder bio section, tech stack strip, footer. Copy is sales-focused and honest.

---

### Structural Weaknesses

#### 1. Organizations server directory has too many files for overlapping concerns

**Severity**: medium

**Evidence**: `features/organizations/server/` has 8 files:

- `current-organization.ts` — fetches full org + members + subscription
- `current-organization-context.ts` — wraps above + derives permissions (canInvite, canManage)
- `ensure-active-organization.ts` — sets active org if unset
- `organization-membership.ts` — gets membership, enforces role requirements
- `organization-invitations.ts` — invite/cancel/resend operations
- `get-admin-organization-detail.ts` — admin view
- `list-admin-organizations.ts` — admin list

**Why it's a problem**: `getCurrentOrganization()` and `getCurrentOrganizationContext()` do related work but are separate files. A buyer editing org context must decide which to use and trace through both. `ensureActiveOrganization` and `getActiveOrganizationMembership` also overlap conceptually.

**Buyer impact**: Confusion about which org-context function to call. Medium navigation tax.

**Smallest fix**: Merge `current-organization.ts` and `current-organization-context.ts` into a single file. Merge `ensure-active-organization.ts` into `organization-membership.ts`. Result: 6 files instead of 8, clearer ownership.

#### 2. Auth form components are slightly over-split for a multi-step flow

**Severity**: low-medium

**Evidence**: Sign-in flow spans 6+ components:

- `SignInForm` (167 LOC)
- `AuthEmailStep` (49 LOC)
- `SignInPasswordStep` (132 LOC)
- `AuthSecondaryActions` (75 LOC)
- `OAuthButtons` (49 LOC)
- `ResendVerificationForm` (49 LOC)

**Why it's a problem**: A buyer wanting to customize the sign-in page needs to trace through 4–5 files minimum. The email step is shared between sign-in and sign-up (good reuse), but the total component count creates navigation tax.

**Buyer impact**: 15–20 minutes to understand sign-in flow instead of 5–10.

**Smallest fix**: Merge `SignInForm` + `SignInPasswordStep` into one component. Keep `AuthEmailStep` as shared. Reduces sign-in from 6 to 4 components.

#### 3. The "ai" vs "assistant" feature split is theoretically justified but practically confusing

**Severity**: low-medium

**Evidence**: `features/ai/` (10 files) contains "AI infrastructure" (conversations, model selection, settings). `features/assistant/` (15 files) contains the specific assistant UI and tools. The split is designed for multiple "surfaces" but only one exists (`ai-surfaces.ts` has a single entry: `"assistant"`).

**Why it's a problem**: Buyers will ask "why are there two AI folders?" The answer — "ai/ is infrastructure for multiple chat surfaces" — requires reading `ai-surfaces.ts` to discover that only one surface exists. This is premature abstraction for a starter.

**Buyer impact**: 5–10 minutes wasted understanding the split. Low risk of modification errors, but adds cognitive overhead.

**Smallest fix**: Add a 3-line comment in `features/ai/ai-surfaces.ts` explaining the split and when a buyer would add a second surface. Or merge into a single `features/assistant/` with a `server/` subdirectory for infrastructure.

#### 4. auth-requests.ts is a 221-line client wrapper

**Severity**: low

**Evidence**: `features/auth/client/auth-requests.ts` wraps every `authClient` call with error handling and result typing. Functions: `signInWithPassword`, `signUpWithPassword`, `signInWithOAuth`, `sendMagicLink`, `requestPasswordReset`, `resetPassword`.

**Why it's a problem**: The wrapper adds a layer between components and the auth client. Each function is 15–30 lines of error handling + type narrowing. A buyer must read this file to understand what auth operations are available and how errors are returned.

**Buyer impact**: Low. The error handling is genuinely useful. But a buyer might not realize this file exists and try to call `authClient` directly.

**Smallest fix**: None required. Consider adding a comment at the top explaining this is the auth operations layer for client components.

---

### Overbuilt Areas (Features)

#### 1. PromptInput component family (12 exports, context provider)

**Severity**: low

`shared/components/ai-elements/prompt-input.tsx` exports 12 named components (PromptInput, PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputTools, PromptInputSubmit, etc.) requiring 7 levels of nesting to assemble a chat input. Compare to shadcn/ui's typical 2–3 level nesting. This is the ai-elements library, not custom code, so the overhead is inherited rather than self-inflicted. But it does increase the learning curve for AI feature modification.

#### 2. Task form sheet union type pattern

**Severity**: low

`features/tasks/components/task-form-sheet.tsx` (108 lines) splits into `CreateTaskSheet` and `UpdateTaskSheet` using a union type discriminator, but both branches contain nearly identical `useActionState` + `useToastMessage` + `useEffect` logic. Could be a single component with a `mode` prop.

#### 3. Task code auto-generation with 10-attempt retry

**Severity**: low

`features/tasks/server/task-mutations.ts:64-98` — production-correct for race conditions, but adds 35 lines of complexity to the CRUD template that most buyers won't need initially.

#### 4. Organization view type mapping

**Severity**: low

`features/organizations/server/current-organization.ts` transforms betterAuth API responses into app-specific view types with manual mapping functions (`mapOrganizationMember`, `mapCurrentOrganization`). Correct for decoupling, but adds indirection that a buyer must trace through.

#### 5. Three-level action wrapping

**Severity**: low

`validated-organization-owner.action.ts` (54 lines) creates three levels of action wrapping: validated -> authenticated -> organization-owner. Each level is justified, but the stack is 3 deep.

---

### Risky Patterns

#### 1. Implicit org initialization hidden in post-sign-in

**Severity**: medium

**Evidence**: `features/auth/server/onboarding.ts:ensureUserWorkspace()` creates the user's first organization automatically. This is called from `app/post-sign-in/page.tsx`, not from the sign-up form itself. A buyer who doesn't trace the post-sign-in redirect will not understand when or how organizations are created.

**Buyer impact**: Confusion when customizing the sign-up flow. Could accidentally break org creation by modifying post-sign-in without understanding its implicit responsibility.

**Smallest fix**: Add a clear comment in `post-sign-in/page.tsx` explaining that `ensureUserWorkspace()` creates the first org and must not be removed.

#### 2. PlanId is a hardcoded union type, not derived from config

**Severity**: low

**Evidence**: `shared/config/billing.config.ts:25` — `export type PlanId = "free" | "pro" | "team"`. Adding a fourth plan requires updating both the config array and this type.

**Buyer impact**: Type error if buyer adds a plan to config but forgets the type. Easy to fix once discovered, but could be prevented.

**Smallest fix**: `type PlanId = (typeof billingConfig.plans)[number]["id"]` — derive from config.

#### 3. Conversation JSON full-replace on every message

**Severity**: low

**Evidence**: `features/ai/server/ai-conversations.ts:replaceAiConversation()` serializes the entire message array and overwrites the `messagesJson` column on every chat message. Not append-only.

**Buyer impact**: Works fine for typical conversations (<100 messages). Could become a performance concern for very long conversations. Not a blocker for a starter.

**Smallest fix**: Document the tradeoff. Consider append-only if AI conversations become a power feature.

#### 4. Demo data in AI tools

**Severity**: medium

**Evidence**: `features/assistant/server/demo-inbox.ts` returns 5 hardcoded emails. Invoice tool returns computed data without calling any API.

**Buyer impact**: Looks impressive in demo, but buyer must replace entire tool implementations before shipping. Gap between demo and production is larger than it appears.

**Smallest fix**: Add `// TODO: Replace with real email API integration` comments. Create a `TOOL_INTEGRATION.md` guide.

---

### Easiest Wins

1. **Add a "How to Add a Feature" guide** — buyers will clone the tasks feature. A 1-page guide showing which files to copy and what to change would dramatically reduce time-to-first-modification.
2. **Merge org context server files** — consolidate `current-organization.ts` + `current-organization-context.ts`. 30 minutes of work, removes a real source of confusion.
3. **Add comments on implicit flows** — `ensureUserWorkspace()` in post-sign-in, org auto-creation, and `resumeCheckoutAfterSignIn()` all need 1–2 line comments explaining their purpose.
4. **Derive PlanId from config** — 1-line type change, prevents a common buyer mistake.
5. **Include actual screenshots** — replace placeholder images in `screenshots-gallery.tsx` with screenshots of the starter's own pages.

---

### Feature Groups: Hardest to Modify

1. **Organizations** — most server files (8), layered patterns (betterAuth plugin + custom wrappers), implicit initialization, multiple context functions. A buyer editing org behavior must understand both betterAuth's organization plugin and the custom server wrappers. Time to understand: ~20 minutes.
2. **Auth** — multi-step component split (12 components for sign-in + sign-up), betterAuth API surface (buyer must learn betterAuth docs), OAuth config spread across files. Time to understand: ~15 minutes.
3. **AI/Assistant** — two feature folders to understand, ai-elements component library learning curve, streaming internals require ai-sdk knowledge. Time to understand: ~20 minutes for tactical changes, longer for architectural changes.

---

### Feature Groups: Easiest to Modify

1. **Tasks** — clear template, direct mutations, no hidden magic. Time to understand: ~15 minutes.
2. **Billing** — config-driven, adding plans/capabilities/limits is mechanical. Time to change prices: ~6 minutes. Time to add a plan: ~15 minutes.
3. **Marketing** — pure presentation components, no server logic, obvious structure. Time to customize: ~10 minutes.
4. **Account** — focused dialogs, clear action/server split, no cross-feature dependencies. Time to understand: ~10 minutes.
5. **Admin/Users** — straightforward CRUD, self-contained. Admin panel has impersonation, ban/unban, role management, session revocation. Time to understand: ~10 minutes.

---

### File-Count / Indirection / Navigation Problems

| Feature       | Files | Assessment                                                    |
| ------------- | ----- | ------------------------------------------------------------- |
| tasks         | 14    | Proportionate. 8 components for full CRUD with bulk ops.      |
| billing       | 23    | Proportionate. Stripe integration genuinely requires this.    |
| organizations | 22    | Slightly high. 8 server files could be 6.                    |
| auth          | 21    | Slightly high. 12 form components could be 9.                |
| assistant     | 15    | Proportionate. Chat UI with tools, sidebar, model selection.  |
| ai            | 10    | Justified if multi-surface is planned. Otherwise mergeable.   |
| account       | 14    | Clean. Every file earns its place.                            |
| marketing     | 11    | Clean. All presentation.                                      |
| users         | 8     | Clean.                                                        |
| admin         | 5     | Lean.                                                         |
| dashboard     | 3     | Lean.                                                         |
| settings      | 2     | Correct. Navigation config only.                              |

**Total**: 148 files across 12 features. No feature is egregiously oversized. The two that need trimming (organizations, auth) need only 2–3 merges each.

---

### Naming Problems

No significant naming problems found. The naming convention is consistent and predictable:

- `.action.ts` suffix for server actions
- `.schema.ts` for Zod schemas
- `.types.ts` for type definitions
- Kebab-case file names match their exports
- Feature directory names match business domains

**One minor issue**: `features/billing/plans/index.ts` is a re-export barrel file (26 lines). It re-exports from `shared/config/billing.config.ts` and `subscription-status.ts`. This means imports like `from "@/features/billing/plans"` resolve differently than expected — they pull from `shared/config/billing.config.ts`, not from the plans directory. Mildly confusing.

---

### Candidate Merges or Simplifications

| Current                                                                             | Proposed                                          | Rationale                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `organizations/server/current-organization.ts` + `current-organization-context.ts`  | Single `current-organization.ts`                  | Overlapping responsibilities                             |
| `organizations/server/ensure-active-organization.ts`                                | Inline into `organization-membership.ts`          | 39 lines, single caller                                 |
| `auth/components/sign-in/sign-in-form.tsx` + `sign-in-password-step.tsx`            | Single `sign-in-form.tsx`                         | Reduces file-hopping for sign-in customization           |
| `auth/components/sign-up/sign-up-form.tsx` + `sign-up-password-step.tsx`            | Single `sign-up-form.tsx`                         | Same rationale                                           |
| `tasks/components/task-form-sheet.tsx` (CreateTaskSheet + UpdateTaskSheet)           | Single component with mode prop                   | Eliminate duplicated useActionState logic                 |
| `features/ai/` + `features/assistant/`                                              | Single `features/assistant/` with subdirs          | Only one surface exists; remove premature abstraction    |
| `billing/plans/index.ts`                                                            | Remove barrel, import directly                    | Eliminates indirection for 3 re-exports                  |
| `features/ai/server/model-selection-error.ts`                                       | Merge into `resolve-model-selection.ts`           | 9-line file, single usage                                |
| `features/ai/ai-surfaces.ts`                                                       | Add comment or merge into assistant               | 6-line file with one constant                            |

---

## Top 10 Problems in the Repo

### 1. No "How to Add a Feature" Documentation

**Severity**: critical
**Category**: buyer experience

**Evidence**: No GUIDE.md, no README in features/, no template directory. The tasks feature is the implicit template but this is never stated.

**Buyer impact**: First 30–60 minutes after purchase are spent reverse-engineering the pattern instead of building.

**Smallest fix**: Add `features/ADDING_A_FEATURE.md` — 1 page showing which files to create, which to copy from tasks, and the 5-step pattern (schema, mutation, action, component, route).

---

### 2. Organization Context Layering Creates Confusion

**Severity**: high
**Category**: feature architecture

**Evidence**: `getCurrentOrganization()`, `getCurrentOrganizationContext()`, `getActiveOrganizationMembership()`, `ensureActiveOrganization()` — four functions to get "what org am I in?"

**Buyer impact**: "Which one do I call?" is a real question a buyer will face in the first week.

**Smallest fix**: Consolidate to two functions: `getCurrentOrganization()` (data) and `requireOrganizationMembership()` (guard). Merge context into organization, merge ensure into membership.

---

### 3. Implicit Organization Creation in Post-Sign-In

**Severity**: high
**Category**: hidden behavior

**Evidence**: `app/post-sign-in/page.tsx` calls `ensureUserWorkspace()` which auto-creates the user's first organization. Not documented, not obvious.

**Buyer impact**: Buyer modifies post-sign-in flow, breaks org creation, spends hours debugging "why does my new user have no organization?"

**Smallest fix**: Add a clear comment block in post-sign-in explaining each step and why it's critical.

---

### 4. Auth Form Components Over-Split

**Severity**: medium
**Category**: navigation tax

**Evidence**: 12 components for sign-in + sign-up. Sign-in alone needs 4–5 files to trace.

**Buyer impact**: Customizing auth pages takes 3x longer than necessary.

**Smallest fix**: Merge form + password-step for each auth flow. Target: 8 components instead of 12.

---

### 5. PlanId Not Derived from Config

**Severity**: medium
**Category**: buyer footgun

**Evidence**: `type PlanId = "free" | "pro" | "team"` is manually maintained alongside `billingConfig.plans`.

**Buyer impact**: Buyer adds a plan to config, forgets to update type, gets confusing TypeScript errors.

**Smallest fix**: `type PlanId = (typeof billingConfig.plans)[number]["id"]` — one line.

---

### 6. Demo Data in AI Tools (Not Production-Ready)

**Severity**: medium
**Category**: feature credibility

**Evidence**: `features/assistant/server/demo-inbox.ts` returns 5 hardcoded emails. Invoice tool returns computed data without calling any API.

**Buyer impact**: Looks impressive in demo, but buyer must replace entire tool implementations before shipping. Gap between demo and production is larger than it appears.

**Smallest fix**: Add `// TODO: Replace with real email API integration` comments. Create a `TOOL_INTEGRATION.md` guide.

---

### 7. Missing Screenshots in Marketing Landing Page

**Severity**: medium
**Category**: launch readiness

**Evidence**: `features/marketing/components/screenshots-gallery.tsx` references 7 placeholder images.

**Buyer impact**: Buyer must take and process screenshots before the landing page is presentable. Not a code issue, but delays launch.

**Smallest fix**: Include actual screenshots of the starter's own pages as defaults.

---

### 8. Admin Organizations Page Possibly Incomplete

**Severity**: medium
**Category**: feature gap

**Evidence**: `features/admin/config/admin-navigation.ts` includes an "Organizations" link. `features/organizations/components/admin-organizations-table.tsx` exists (425 lines). But the admin org management flow may be incomplete or the page may not be fully wired up.

**Buyer impact**: Admin panel feels unfinished if key pages are stubs.

**Smallest fix**: Verify the admin organizations page renders properly and has basic CRUD.

---

### 9. No Test Coverage Guidance for Buyers

**Severity**: low-medium
**Category**: buyer experience

**Evidence**: 13 test files exist covering billing, tasks, AI, organizations (~1,500 LOC). But there's no guidance on how to add tests for new features.

**Buyer impact**: Tests exist but the test pattern isn't documented. Buyer may skip testing or write inconsistent tests.

**Smallest fix**: Add a test template alongside the "how to add a feature" guide.

---

### 10. Billing Plans Barrel File Creates Import Confusion

**Severity**: low
**Category**: code navigation

**Evidence**: `features/billing/plans/index.ts` re-exports from `shared/config/billing.config.ts`. Imports like `from "@/features/billing/plans"` actually resolve to shared/config.

**Buyer impact**: "Where is getPlan defined?" leads to a goose chase through re-exports.

**Smallest fix**: Remove the barrel file. Import directly from `@/shared/config/billing.config` and `@/features/billing/plans/subscription-status`.

---

## Overbuilt or Too Sophisticated Areas

1. **ai-elements PromptInput family** (12 exports, 7-level nesting) — inherited from library, not custom code, but still raises the learning curve for chat UI modification.
2. **ai/assistant two-folder split** — justified architecture for multi-surface AI, but only one surface exists. Premature for a starter.
3. **Task code auto-generation with 10-attempt retry** (`task-mutations.ts:64-98`) — production-correct for race conditions, but adds 35 lines of complexity to the CRUD template that most buyers won't need initially.
4. **Organization view type mapping** (`current-organization.ts`) — transforms betterAuth API responses into app-specific view types with manual mapping functions. Correct for decoupling, but adds indirection that a buyer must trace through.
5. **Validated organization owner action** (`validated-organization-owner.action.ts`, 54 lines) — three levels of action wrapping (validated -> authenticated -> organization-owner). Each level is justified, but the stack is 3 deep.

---

## Strong / Sellable Areas

1. **Billing config + plan gating** — the `assertCapability()` / `consumeMonthlyUsage()` pattern is the strongest feature. Config-driven, type-safe, and genuinely production-ready. This alone justifies the purchase for many buyers.
2. **Tasks as a CRUD template** — demonstrates billing integration, multi-tenancy, bulk operations, data tables with filtering/sorting/pagination. The right level of complexity for a real feature.
3. **Dashboard page** — real content showing plan status, usage meters, quick actions, and conditional rendering based on plan capabilities. Not a placeholder.
4. **Marketing landing page** — 11 well-crafted components with honest copy, code proof sections, comparison tables, FAQ. Production-quality for a starter product page.
5. **Admin panel with user management** — impersonation, ban/unban, role management, session revocation. Real admin functionality, not a stub.
6. **Stripe webhook handling** — single entry point, clean event routing, robust subscription sync with upsert. Handles edge cases (missing customer, incomplete data).
7. **AI assistant with tool-calling** — streaming chat, three demonstrated tools, billing-integrated, org-scoped conversations. Differentiating feature.
8. **Account management** — delete-account with blocker checks (sole owner of active subscription), OAuth linking/unlinking, password management. Production-thoughtful.
9. **Type-safe form action pattern** — `validatedAuthenticatedAction` + Zod + `FormActionState` is a clean, reusable server action pattern that buyers learn once.
10. **Test suite** — 13 test files covering billing guards, usage service, webhooks, task creation, org membership, AI conversations. Not comprehensive, but covers the critical paths.

---

## Missing or Weak Features

1. **No "how to add a feature" guide** — the single most impactful missing piece for buyer onboarding.
2. **No email templates visible** — `react-email` is configured but email templates aren't prominently showcased. Buyers need to see what transactional emails look like.
3. **No activity/audit log** — no record of who changed what. Common SaaS requirement.
4. **No API key management** — `api.access` capability exists but no API key UI or management.
5. **No file upload / storage** — `storageMb` limit is defined but no upload infrastructure exists.
6. **No onboarding flow** — after first sign-up, user lands on dashboard. No welcome wizard, no setup steps.
7. **No notification system** — no in-app notifications, no notification preferences.
8. **No search across entities** — command menu exists but entity search implementation isn't visible.
9. **No environment variable documentation** — Stripe price IDs, OAuth secrets, and AI API keys all need clear setup docs beyond `.env.example`.
10. **No dark mode screenshots** — theme support exists but marketing doesn't showcase it.

---

## Highest ROI Fixes

### 1. Add "How to Add a Feature" Documentation

**What to change**: Create `features/ADDING_A_FEATURE.md` with a step-by-step guide: copy tasks, rename, modify schema, update billing config, add route.

**Why it matters**: Reduces time-to-first-modification from 60 minutes to 15 minutes. The single most impactful change for buyer satisfaction.

**Expected impact**: High. Turns "I need to figure this out" into "I follow the guide."

**Size**: Small (1–2 hours).

### 2. Consolidate Organization Context Functions

**What to change**: Merge `current-organization.ts` + `current-organization-context.ts` into one. Merge `ensure-active-organization.ts` into `organization-membership.ts`.

**Why it matters**: Removes the "which function do I call?" confusion. Reduces org server files from 8 to 6.

**Expected impact**: Medium-high. Directly reduces cognitive overhead for the most-touched shared infrastructure.

**Size**: Small-medium (2–3 hours).

### 3. Derive PlanId Type from Config

**What to change**: Replace `type PlanId = "free" | "pro" | "team"` with derived type from `billingConfig.plans`.

**Why it matters**: Prevents the most common buyer mistake when adding plans. Small change, big safety improvement.

**Expected impact**: Medium. Prevents a guaranteed footgun.

**Size**: Small (30 minutes).

### 4. Merge Auth Form Step Components

**What to change**: Combine `sign-in-form.tsx` + `sign-in-password-step.tsx` into one file. Same for sign-up. Keep shared components (AuthEmailStep, OAuthButtons) separate.

**Why it matters**: Reduces sign-in from 5 files to 3. Buyers customize auth pages early — this is high-traffic code.

**Expected impact**: Medium. Reduces file-hopping for the most commonly customized feature.

**Size**: Medium (3–4 hours).

### 5. Add Comments on Implicit Flows

**What to change**: Document `ensureUserWorkspace()` in post-sign-in, `resumeCheckoutAfterSignIn()`, org auto-creation, and the `ai-surfaces` concept with clear comments.

**Why it matters**: Hidden behavior creates debugging nightmares. 10 minutes of comments saves buyers hours.

**Expected impact**: Medium. Prevents the top 3 "why isn't this working" buyer moments.

**Size**: Small (1 hour).

---

## File-Level Simplification Targets

| Target                                                          | Action                                  | Rationale                                              |
| --------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `features/organizations/server/current-organization-context.ts` | Merge into `current-organization.ts`    | Overlapping concerns                                   |
| `features/organizations/server/ensure-active-organization.ts`   | Merge into `organization-membership.ts` | 39 lines, closely related                              |
| `features/auth/components/sign-in/sign-in-password-step.tsx`    | Merge into `sign-in-form.tsx`           | Reduce file-hopping for auth customization             |
| `features/auth/components/sign-up/sign-up-password-step.tsx`    | Merge into `sign-up-form.tsx`           | Same rationale                                         |
| `features/billing/plans/index.ts`                               | Delete (re-export barrel)               | Import directly from source files                      |
| `features/ai/ai-surfaces.ts`                                    | Add comment or merge into assistant     | 6-line file with one constant                          |
| `features/ai/server/model-selection-error.ts`                   | Merge into `resolve-model-selection.ts` | 9-line file, single usage                              |
| `features/tasks/components/task-form-sheet.tsx`                  | Simplify to single component            | CreateTaskSheet/UpdateTaskSheet duplicate logic         |
| `shared/config/billing.config.ts` line 25                       | Change PlanId to derived type           | Prevent buyer footgun                                  |

---

## Final Recommendation

**Near ready, polish and document.**

The codebase is structurally sound. The feature architecture is genuinely buyer-friendly — feature-first, proportionate complexity, consistent patterns, and real production concerns (billing gating, multi-tenancy, usage limits) handled correctly. The billing system is the best I've seen in a starter at this price point.

What's needed before selling with confidence:

1. **Documentation** (critical): "How to Add a Feature" guide, env setup guide, and comments on implicit flows. This is the #1 gap.
2. **Minor consolidation** (high value): Merge org context files, merge auth form steps. 1–2 days of work for meaningful clarity improvement.
3. **One-line fixes**: Derive PlanId from config. Costs nothing, prevents a guaranteed buyer mistake.
4. **Marketing polish**: Real screenshots, builder bio section filled in.

The architecture does not need restructuring. The features do not need simplification beyond the merges listed above. The patterns are correct and the complexity is earned. Ship it after documentation and the 5 highest-ROI fixes above.
