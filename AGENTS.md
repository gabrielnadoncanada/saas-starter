# Agent Rules

## Root Cause First

- Never apply a quick fix when the underlying issue is still broken.
- Always solve the root cause instead of patching symptoms.
- Never choose a workaround if it introduces regression risk or leaves the real fault in place.
- Prefer durable fixes that keep behavior correct across the full flow, not just the failing surface case.
- If a true root-cause fix is blocked by environment or tooling, state the blocker explicitly instead of silently patching around it.

## File Size Limit

- Never create or keep a file with more than 250 lines.
- When a file approaches 250 lines, refactor or split it before adding more code.
  Strict refactor mode.

You must optimize for the cleanest final architecture, not for backward compatibility.

Hard rules:

- Do not preserve legacy behavior unless explicitly requested.
- Do not add compatibility layers.
- Do not add adapters, wrappers, shims, aliases, or fallbacks.
- Do not keep deprecated code paths alive.
- Do not support old and new implementations in parallel.
- Do not make the new implementation conform to outdated patterns.
- Do not leave transitional code for “later”.
- Do not keep optional branches just to avoid updating call sites.

Expected behavior:

- Refactor dependent code to match the new design.
- Replace obsolete structures directly.
- Remove dead, deprecated, or redundant code after replacement.
- Normalize the codebase around one clear approach.
- Prefer a clean breaking internal refactor over a messy compatibility patch.
- If multiple files must change to keep the architecture coherent, change them.

Decision rule:
If the choice is between:

1. preserving legacy compatibility with added complexity
2. performing a clean refactor that breaks old internal usage

choose option 2 by default.

Output standard:

- Final code should reflect the target architecture only.
- No dual implementation.
- No temporary migration layer.
- No defensive support for hypothetical old usage.
- Keep the solution simple, explicit, and maintainable.

## Buyer Fit

- Always optimize for ShipFast-style indies and small technical teams.
- Assume the buyer wants to ship fast, understand the code fast, and modify features without learning an internal framework first.
- Prefer decisions that reduce time-to-understand, time-to-modify, and time-to-ship.
- Do not introduce abstractions whose main value is invisible to the buyer.
- Treat enterprise-style patterns as suspicious unless the complexity clearly justifies them.
- A solution can be technically valid and still be the wrong fit for the product.

## Abstraction Budget

- Do not add a new abstraction unless it clearly reduces repetition, cognitive load, or future change cost for this specific codebase.
- Prefer one obvious function over a service, one direct import over dependency scaffolding, and one local helper over a reusable framework pattern.
- Do not introduce dependency injection, repositories, use-cases, command handlers, or factory layers by default.
- Extra structure is allowed only when the underlying workflow is genuinely complex, high-risk, or highly reusable.
- If an abstraction needs explanation before it feels useful, it is probably too expensive.

## Feature Placement

- Place code by real ownership, not by URL path, menu location, or role access alone.
- Always separate route surface, authorization, business domain, and shared infrastructure.
- `app/` owns route files only: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`.
- `features/auth/` owns session lookup, guards, permissions, and access-control helpers.
- `features/admin/` owns the admin shell only: admin layout, navigation, overview widgets, and shell-specific UI.
- Business domains own their own behavior even when the entry route is admin-only. Example: `/admin/users` belongs to `features/users/`, not `features/admin/users/`.
- Put Better Auth or other provider bootstrap code in `lib/`. Put app-specific auth usage helpers such as `require-admin` in `features/auth/`.
- Prefer the business domain over `admin` whenever a file manipulates users, organizations, billing, invoices, or system settings.
- Dependency direction is `app -> features -> lib`.
- Business features must not depend on `features/admin/`.
- `lib/` must not depend on feature folders.

## UI Consistency

- Use as few custom CSS classes as possible.
- Prefer `shadcn/ui` components and their existing variants before building custom UI primitives.
- Do not create bespoke styling patterns when a `shadcn/ui` component or composition already solves the need.
- Keep the visual system coherent by extending the shared component set instead of scattering one-off class-based implementations.

## Local Database

- You can always reset the local database when needed.
- Do not treat the local database like production.
- If a clean reset is the fastest correct way to resolve local Prisma drift or schema mismatch, do it.
- En local, privilegie la remise a zero propre des etats casses (DB, caches, artefacts generes, migrations ratees) plutot que les contournements conservateurs.
