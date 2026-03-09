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
components/
  ui/
  shared/
lib/
hooks/
types/
constants/
```

`hooks/`, `types/`, and `constants/` are optional. Use them only when they add real clarity.

## Feature default

For most business features, start with:

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

Use only the folders that are actually needed.

## Folder responsibilities

### `app/`

Use `app/` only for Next.js route files and route composition.

Typical files:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `route.ts`

Keep `app/` thin. Do not place heavy business logic here.

### `features/`

Use `features/` for domain-specific code.

Inside a feature by default:

- `actions/` = server actions
- `components/` = feature-specific UI
- `server/` = feature-specific server-only logic
- `schemas/` = runtime validation
- `utils/` = pure helpers
- `types/` = shared feature contracts only

See `references/server-actions.md` for the exact split between `actions/` and `server/`.

### `components/`

Use `components/` for shared UI reused across the app.

Recommended structure:

- `components/ui/` = base or design-system UI
- `components/shared/` = reusable app-level components

Do not place feature-specific business logic here.

### `lib/`

Use global `lib/` only for shared technical infrastructure across the app.

Examples:

- auth setup
- database client
- Stripe helpers
- Supabase setup
- framework integrations
- generic utility functions

Do not use global `lib/` for feature-specific business logic.

Inside a feature, prefer `server/` or `utils/` over a catch-all local `lib/`.

### `hooks/`

Use hooks only for real reusable React behavior.

Prefer server components and server-loaded props before introducing custom hooks.

Do not create hooks for:

- simple pure functions
- trivial wrappers
- code that can stay in a server component
- logic used in only one small local place unless a hook clearly improves readability

## Placement rules

Use these rules when deciding where code should live:

- route files and route composition -> `app/`
- business logic for one domain -> `features/<feature>/`
- shared UI -> `components/`
- shared technical infrastructure -> `lib/`
- reusable app-wide React behavior -> `hooks/`
- feature-specific React behavior -> `features/<feature>/hooks/` only when really needed
- feature-specific server-only code -> `features/<feature>/server/`
- feature-specific pure helpers -> `features/<feature>/utils/`

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

Do not mix naming styles in the same codebase.

## Core rules

- keep the structure simple
- keep `app/` thin
- put business logic in `features/`
- keep shared UI generic
- prefer `server/` for feature-specific server logic
- prefer `utils/` for feature-specific pure helpers
- use hooks only for real React behavior
- avoid adding folders and layers too early
- do not over-design small SaaS starters
- keep database access out of server actions by default
- optimize for easy testing of server logic

## Review workflow

When reviewing a structure or suggesting a refactor:

1. start from the default structure above
2. keep `app/` thin
3. move domain logic into `features/`
4. separate shared UI from feature UI
5. replace ambiguous feature-local `lib/` folders with clearer folders such as `server/` or `utils/` when appropriate
6. rename misleading files such as feature-local `XxxPage.tsx`
7. move Prisma queries and transactions out of `actions/` and into `server/` by default
8. keep the recommendation pragmatic and small
9. add abstraction only when complexity clearly justifies it

## Reference files

Consult these references when relevant:

- feature structure examples -> `references/examples.md`
- naming details -> `references/naming.md`
- common mistakes and anti-patterns -> `references/anti-patterns.md`
- scaling guidance -> `references/scaling.md`
- exact `actions/` versus `server/` boundary -> `references/server-actions.md`

## Output expectations

When answering:

1. start from the default structure
2. adapt only when the user has a concrete reason
3. explain folder responsibility clearly
4. prefer practical renames over abstract theory
5. avoid enterprise over-design
6. optimize for readability by the next developer, not architectural purity
7. make server logic easy to test by keeping Next.js-specific code at the boundaries
