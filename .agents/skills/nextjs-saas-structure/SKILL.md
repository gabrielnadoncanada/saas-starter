---
name: nextjs-saas-structure
description: pragmatic folder structure and code placement for next.js app router saas projects. use when organizing or reviewing a next.js codebase, deciding where files should live, keeping app routes thin, structuring features, choosing between server, utils, schemas, types, hooks, shared components, and server actions, or preventing over-engineering in indie-friendly saas starters.
---

# Purpose

Use this skill to design or review a simple folder structure for a Next.js App Router SaaS project.

Optimize for:

- fast development
- low cognitive overhead
- feature-based scalability
- clear server/client boundaries
- indie-friendly maintainability
- easy testing of server logic

Prefer pragmatic structure over enterprise layering.

Do not introduce use-cases, repositories, services, DTO layers, or other advanced abstractions by default unless the user explicitly asks for a more advanced architecture or the feature complexity clearly justifies it.

## Default structure

Start from this structure by default:

```txt
app/
features/
shared/
  components/
    ui/
    app/
  config/
  lib/
  constants/
  hooks/
  types/
```

`shared/config/`, `shared/constants/`, `shared/hooks/`, and `shared/types/` are optional. Use them only when they add real clarity.

## Folder responsibilities

### `app/`

Use `app/` only for route files and route composition.
Keep it thin.

### `features/`

Use `features/` for domain-owned product logic.

Default feature shape:

```txt
features/
  <feature>/
    actions/
    components/
    config/
    server/
    schemas/
    utils/
    types/
```

Only add the folders that are actually needed.

### `shared/`

Use root `shared/` for app-wide code that is not owned by one product feature.

Typical responsibilities:

- `shared/components/ui/` = base or design-system UI
- `shared/components/app/` = reusable app-level components
- `shared/config/` = app-wide configuration objects and configuration helpers
- `shared/lib/` = technical infrastructure and cross-feature helpers
- `shared/constants/` = app-level constants
- `shared/hooks/` = app-wide reusable React hooks
- `shared/types/` = app-level shared types

Do not move feature-owned business logic into `shared/`.

## Ownership rule

Choose between `shared/` and `features/` based on ownership, not on whether code is:

- server-side
- reused in a few files
- important
- database-related

Put code in `shared/` when:

- it is app-wide technical infrastructure
- it is app-level reusable UI
- it integrates a framework or external service
- it would still make sense if one feature disappeared

Examples:

- `shared/lib/db/prisma.ts`
- `shared/lib/auth/providers.ts`
- `shared/lib/env.ts`
- `shared/components/ui/button.tsx`
- `shared/components/app/PageHeader.tsx`
- `shared/constants/routes.ts`

Put code in `features/<feature>/` when:

- it belongs to one domain
- it expresses business rules or workflows
- it contains feature-specific queries, validation, or UI

Examples:

- `features/tasks/server/create-task.ts`
- `features/teams/server/invite-member.ts`
- `features/auth/server/delete-account.ts`
- `features/billing/server/create-checkout-session.ts`

## Config folders

Use a `config/` folder when a domain or the whole app has a small number of explicit configuration files that developers are expected to edit directly.

Good reasons to add `config/`:

- pricing plans and billing definitions
- navigation definitions
- role or permission matrices
- feature flags with app-defined defaults
- product-facing option lists that drive behavior in multiple places

Do not add `config/` just because a file exports an object.

Do not create `config/` for:

- environment variable parsing
- SDK client setup
- database clients
- one-off constants
- business logic disguised as data

Use `shared/config/` when the configuration is app-wide and not owned by one feature.

Examples:

- `shared/config/navigation.config.ts`
- `shared/config/app-shell.config.ts`
- `shared/config/marketing.config.ts`

Use `features/<feature>/config/` when the configuration belongs to a single domain and would disappear with that feature.

Examples:

- `features/billing/config/billing.config.ts`
- `features/teams/config/roles.config.ts`
- `features/inbox/config/inbox-navigation.config.ts`

## Config ownership rule

Put a config file in `features/<feature>/config/` when:

- it defines business-facing options for one feature
- its values are meaningful mainly inside that feature
- changing it primarily changes one feature's behavior

Put a config file in `shared/config/` when:

- multiple unrelated features depend on it
- it defines app-wide structure or conventions
- it is still meaningful even if one feature is removed

If the file mixes app-wide concerns and one feature's business rules, split it.

Example:

- billing plans -> `features/billing/config/`
- app navigation used across dashboard areas -> `shared/config/`
- auth provider labels used only in auth screens -> `features/auth/config/`
- auth library initialization -> `shared/lib/`, not `shared/config/`

## Boundaries

Use these defaults:

- route files and route composition -> `app/`
- domain-owned product logic -> `features/<feature>/`
- app-wide shared code -> `shared/`
- app-wide configuration objects -> `shared/config/`
- feature-specific server-only code -> `features/<feature>/server/`
- feature-specific configuration objects -> `features/<feature>/config/`
- feature-specific pure helpers -> `features/<feature>/utils/`
- feature-specific UI -> `features/<feature>/components/`

Inside a feature, prefer `server/` or `utils/` over a catch-all local `lib/`.

Do not let root shared code depend on `features/`.

Good:

- `features/tasks/server/create-task.ts` imports `shared/lib/db/prisma.ts`

Bad:

- `shared/lib/auth/auth.ts` imports `features/auth/server/...`

## Naming rules

Use consistent naming.

Default recommendation:

- route files in `app/` keep Next.js names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- do not name feature components `XxxPage.tsx`
- prefer `XxxSection.tsx`, `XxxPanel.tsx`, `XxxForm.tsx`, `XxxCard.tsx`
- config files -> `xyz.config.ts`
- components -> `PascalCase.tsx`
- hooks -> `useXxx.ts`
- schemas -> `domain.schema.ts`
- types -> `domain.types.ts`
- mappers -> `domain.mapper.ts`
- actions -> `do-something.action.ts`

For config naming:

- prefer singular names when the file represents one cohesive domain config
- prefer descriptive names over generic `index.ts`
- avoid `settings.ts`, `data.ts`, or `options.ts` unless the meaning is obvious

Good:

- `billing.config.ts`
- `navigation.config.ts`
- `roles.config.ts`
- `plans.config.ts`

Bad:

- `billing.ts`
- `config.ts`
- `stuff.ts`
- `app-settings.ts` when it is really feature config

## What config files should contain

A config file should usually contain:

- static or near-static configuration objects
- typed keys and narrow helper types
- small normalization helpers directly tied to that config
- comments that clarify editing intent when needed

Good examples:

- billing plan definitions
- route group navigation items
- plan capability matrices
- provider labels and supported options

A config file should usually not contain:

- database queries
- framework request handling
- Stripe, Prisma, or auth client initialization
- mutations, transactions, or side effects
- large validation workflows
- feature orchestration logic
- hidden business rules that should live in `server/`

If a config file needs async work, external API calls, or runtime mutation to make sense, it is probably not config.

Keep config files explicit and readable. A buyer should be able to open the file and understand what can be changed without tracing a workflow first.

## Core rules

- keep the structure simple
- keep `app/` thin
- keep business logic in `features/`
- keep app-wide reusable code in root `shared/`
- keep app-wide configuration in `shared/config/`
- keep feature-owned configuration in `features/<feature>/config/`
- keep shared UI generic
- keep server actions thin
- keep Prisma and feature workflows in `server/` by default
- avoid adding folders and layers too early
- do not over-design small SaaS starters

## Review workflow

When reviewing a structure or suggesting a refactor:

1. start from the default structure above
2. keep `app/` thin
3. move domain logic into `features/`
4. move app-wide code into root `shared/`
5. separate shared UI from feature UI
6. replace ambiguous feature-local `lib/` folders with `server/` or `utils/`
7. rename misleading files such as feature-local `XxxPage.tsx`
8. move Prisma queries and transactions out of `actions/` and into `server/`
9. keep the recommendation pragmatic and small

## Reference files

Consult these references when relevant:

- feature structure examples -> `references/examples.md`
- naming details -> `references/naming.md`
- common mistakes and anti-patterns -> `references/anti-patterns.md`
- scaling guidance -> `references/scaling.md`
- exact `actions/` versus `server/` boundary -> `references/server-actions.md`
- exact `shared/` versus `features/` ownership -> `references/lib-vs-features.md`

## Output expectations

When answering:

1. start from the default structure
2. adapt only when the user has a concrete reason
3. explain folder responsibility clearly
4. prefer practical renames over abstract theory
5. avoid enterprise over-design
6. optimize for readability by the next developer, not architectural purity
