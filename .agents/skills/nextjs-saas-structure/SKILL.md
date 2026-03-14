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
  lib/
  constants/
  hooks/
  types/
```

`shared/constants/`, `shared/hooks/`, and `shared/types/` are optional. Use them only when they add real clarity.

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

## Boundaries

Use these defaults:

- route files and route composition -> `app/`
- domain-owned product logic -> `features/<feature>/`
- app-wide shared code -> `shared/`
- feature-specific server-only code -> `features/<feature>/server/`
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
- components -> `PascalCase.tsx`
- hooks -> `useXxx.ts`
- schemas -> `domain.schema.ts`
- types -> `domain.types.ts`
- mappers -> `domain.mapper.ts`
- actions -> `do-something.action.ts`

## Core rules

- keep the structure simple
- keep `app/` thin
- keep business logic in `features/`
- keep app-wide reusable code in root `shared/`
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
