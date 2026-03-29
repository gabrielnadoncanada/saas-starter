---
name: nextjs-saas-structure
description: pragmatic folder structure and code placement for next.js app router saas projects. use when organizing or reviewing a next.js codebase, deciding where files should live, keeping app routes thin, structuring features, choosing between server, utils, schemas, types, hooks, app-wide components, and server actions, or preventing over-engineering in indie-friendly saas starters.
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
  app/
lib/
config/
constants/
hooks/
styles/
types/
```

`config/`, `constants/`, `hooks/`, `styles/`, and `types/` are optional. Use them only when they add real clarity.

## Folder responsibilities
### `app/`
Use `app/` only for route files and route composition. Keep it thin.

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
Do not create internal top-level area trees such as `features/admin/users/` or `features/admin/organizations/`.
When a feature grows, keep one feature root and group by responsibility first. Add subfolders inside those responsibility folders when needed.

Example:

```txt
features/
  admin/
    components/
      admin-sidebar.tsx
      admin-topbar.tsx
    config/
      admin-navigation.config.ts
    server/
      get-admin-overview-stats.ts
```

Prefer this over splitting one feature into multiple internal feature-like trees.

## Non-negotiable placement rule
Always separate these concepts:
- route or entry surface
- authorization and permissions
- business domain
- shared infrastructure

Do not place code by URL path or role access alone.

Use these defaults:
- `app/` -> route files only
- `features/auth/` -> session, guards, permissions
- `features/admin/` -> admin shell only
- business domains such as `features/users/`, `features/organizations/`, `features/system-settings/` -> owned behavior
- `lib/` -> technical infrastructure

Admin-only access does not mean admin ownership.

Bad:
- `app/admin/users/page.tsx`
- `features/admin/users/*`

Good:
- `app/admin/users/page.tsx`
- `features/users/*`
- `features/auth/server/require-admin.ts`
- `features/admin/*`

### Root app-wide folders
Use root folders for app-wide code that is not owned by one product feature.

Typical responsibilities:
- `components/ui/` = base or design-system UI
- `components/app/` = reusable app-level components
- `lib/` = technical infrastructure and cross-feature helpers
- `config/` = app-wide configuration objects and configuration helpers
- `constants/` = app-level constants
- `hooks/` = app-wide reusable React hooks
- `styles/` = global styles, theme tokens, and styling entry points
- `types/` = app-level shared types

Do not move feature-owned business logic into root folders.

## Ownership rule
Choose between root app-wide folders and `features/` based on ownership, not on whether code is:
- server-side
- reused in a few files
- important
- database-related

Put code in root folders when:
- it is app-wide technical infrastructure
- it is app-level reusable UI
- it integrates a framework or external service
- it would still make sense if one feature disappeared

Examples:
- `lib/db/prisma.ts`
- `lib/auth/providers.ts`
- `lib/env.ts`
- `components/ui/button.tsx`
- `components/app/page-header.tsx`
- `constants/routes.ts`
- `styles/globals.css`

Put code in `features/<feature>/` when:
- it belongs to one domain
- it expresses business rules or workflows
- it contains feature-specific queries, validation, or UI

Examples:
- `features/tasks/server/create-task.ts`
- `features/teams/server/invite-member.ts`
- `features/auth/server/delete-account.ts`
- `features/billing/server/create-checkout-session.ts`

For auth specifically:
- provider bootstrap, auth client setup, and raw Better Auth integration -> `lib/`
- app-specific auth helpers such as `get-session.ts`, `require-user.ts`, `require-admin.ts`, and `require-permission.ts` -> `features/auth/`

## Config folders
Use a `config/` folder for explicit configuration files that developers are expected to edit directly.

Good reasons to add `config/`:
- pricing plans and billing definitions
- navigation definitions
- role or permission matrices
- feature flags with app-defined defaults
- product-facing option lists that drive behavior in multiple places

Do not create `config/` for environment parsing, SDK setup, database clients, one-off constants, or business logic disguised as data.
Use root `config/` when the configuration is app-wide and not owned by one feature.
Use `features/<feature>/config/` when the configuration belongs to a single domain and would disappear with that feature.

## Boundaries
Use these defaults:
- route files and route composition -> `app/`
- domain-owned product logic -> `features/<feature>/`
- app-wide reusable UI -> `components/`
- app-wide technical infrastructure -> `lib/`
- app-wide configuration objects -> `config/`
- app-wide constants -> `constants/`
- app-wide reusable client hooks -> `hooks/`
- app-wide styling entry points -> `styles/`
- app-level shared types -> `types/`
- feature-specific server-only code -> `features/<feature>/server/`
- feature-specific configuration objects -> `features/<feature>/config/`
- feature-specific pure helpers -> `features/<feature>/utils/`
- feature-specific UI -> `features/<feature>/components/`

Inside a feature, prefer `server/` or `utils/` over a catch-all local `lib/`.
When one feature has multiple areas such as `overview`, `users`, and `organizations`, keep them inside the same feature by organizing subfolders under `actions/`, `components/`, `server/`, `schemas/`, or `types/`.

Do not let root app-wide code depend on `features/`.

Good:
- `features/tasks/server/create-task.ts` imports `lib/db/prisma.ts`

Bad:
- `lib/auth/auth.ts` imports `features/auth/server/...`

Dependency direction:
- `app/` can depend on `features/` and `lib/`
- business features can depend on `features/auth/` and `lib/`
- business features must not depend on `features/admin/`
- `lib/` must not depend on feature folders

## Naming rules
Use consistent naming.

Default recommendation:
- route files in `app/` keep Next.js names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- do not name feature components `XxxPage.tsx`
- prefer `XxxSection.tsx`, `XxxPanel.tsx`, `XxxForm.tsx`, `XxxCard.tsx`
- config files -> `xyz.config.ts`
- components -> `kebab-case.tsx`
- hooks -> `use-xxx.ts`
- schemas -> `domain.schema.ts`
- types -> `domain.types.ts`
- mappers -> `domain.mapper.ts`
- actions -> `do-something.action.ts`

Avoid generic names such as `index.ts`, `settings.ts`, `data.ts`, or `options.ts` unless the meaning is obvious.

## Core rules
- keep the structure simple
- keep `app/` thin
- keep business logic in `features/`
- keep app-wide reusable code in root folders
- keep app-wide configuration in `config/`
- keep feature-owned configuration in `features/<feature>/config/`
- keep shared UI generic
- keep server actions thin
- keep Prisma and feature workflows in `server/` by default
- avoid adding folders and layers too early
- do not split features into internal area trees
- scale by subfolders inside `actions/`, `components/`, `server/`, `schemas/`, or `types/`
- do not over-design small SaaS starters
- do not treat admin-only access as feature ownership
- prefer the business domain over `admin` when ownership is ambiguous

## Review workflow
When reviewing a structure or suggesting a refactor:
1. start from the default structure above
2. keep `app/` thin
3. move domain logic into `features/`
4. move app-wide code into the appropriate root folder
5. separate app-wide UI from feature UI
6. replace ambiguous feature-local `lib/` folders with `server/` or `utils/`
7. rename misleading files such as feature-local `XxxPage.tsx`
8. move Prisma queries and transactions out of `actions/` and into `server/`
9. collapse internal area trees into one feature root when they exist
10. keep the recommendation pragmatic and small

## Reference files
Consult these references when relevant:
- feature structure examples -> `references/examples.md`
- naming details -> `references/naming.md`
- common mistakes and anti-patterns -> `references/anti-patterns.md`
- scaling guidance -> `references/scaling.md`
- exact `actions/` versus `server/` boundary -> `references/server-actions.md`
- exact root folders versus `features/` ownership -> `references/lib-vs-features.md`
- exact admin versus domain placement -> `references/feature-placement.md`

## Output expectations
When answering:
1. start from the default structure
2. adapt only when the user has a concrete reason
3. explain folder responsibility clearly
4. prefer practical renames over abstract theory
5. avoid enterprise over-design
6. optimize for readability by the next developer, not architectural purity
