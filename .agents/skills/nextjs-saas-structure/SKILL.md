---
name: nextjs-saas-structure
description: structure next.js app router projects with a simple and pragmatic architecture for saas starters. use when organizing folders, deciding where code should live, keeping app thin, separating business logic from ui, or reviewing project structure in next.js and react codebases.
---

# Purpose

Use this skill to design or review a simple folder structure for a Next.js App Router SaaS project.

Optimize for:

- fast development
- clear folder boundaries
- feature-based scalability
- low architectural overhead

Do not introduce advanced architecture unless the user explicitly asks for it.

## Default structure

Use this structure by default:

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

Use `features/` for business logic grouped by domain or feature.

Examples:

- `auth`
- `billing`
- `invoices`
- `customers`

A feature may contain:

```txt
features/
  invoices/
    components/
    actions/
    schemas/
    lib/
    types/
    hooks/
```

### `components/`

Use `components/` for shared UI reused across the app.

Recommended structure:

```txt
components/
  ui/
  shared/
```

- `ui/` = design-system or base UI
- `shared/` = reusable app components

Do not place feature-specific business logic here.

### `lib/`

Use `lib/` for shared technical code.

Examples:

- auth helpers
- database clients
- Stripe helpers
- Supabase setup
- generic utility functions

Do not use global `lib/` for feature-specific business logic.

### `hooks/`

Use `hooks/` only for generic reusable React hooks shared across the app.

If a hook belongs to one feature only, place it inside that feature.

Do not create hooks for simple pure functions.

## Placement rules

Use these rules when deciding where code should live:

- route files and route composition -> `app/`
- business logic for one domain -> `features/<feature>/`
- shared UI -> `components/`
- shared technical infrastructure -> `lib/`
- reusable React behavior -> `hooks/` or `features/<feature>/hooks/`

## Naming rules

Use consistent naming.

Default recommendation:

- components -> `PascalCase.tsx`
- hooks -> `useXxx.ts`
- schemas -> `domain.schema.ts`
- types -> `domain.types.ts`
- mappers -> `domain.mapper.ts`
- actions -> `do-something.action.ts`

Prefer consistent suffix naming such as:

- `invoice.schema.ts`
- `invoice.types.ts`
- `invoice.mapper.ts`

Do not mix naming styles in the same codebase.

## Core rules

- keep the structure simple
- keep `app/` thin
- put business logic in `features/`
- keep shared UI generic
- use hooks only for real React logic
- avoid adding architecture too early

## References

Read these only when relevant:

- folder structure examples -> `references/examples.md`
- naming details -> `references/naming.md`
- common mistakes -> `references/anti-patterns.md`
- scaling guidance -> `references/scaling.md`

## Output expectations

When answering:

1. start from the default structure
2. adapt only if the user has a concrete reason
3. explain folder responsibility clearly
4. keep the recommendation pragmatic
5. avoid enterprise over-design
