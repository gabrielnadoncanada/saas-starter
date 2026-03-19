# Technical Architecture

## Purpose
Define the technical direction, conventions, and boundaries that keep the starter usable, understandable, and sellable.

## Architectural objective
Provide a codebase that is production-capable without becoming an internal framework that buyers must learn before being productive.

## Governing standards
- Use `nextjs-saas-structure` as the default standard for folder shape, code placement, and server/client boundaries.
- Use `starter-buyer-fit` as the default standard for judging whether a pattern is commercially appropriate for the target buyer.
- Any deviation from those defaults must be explained in `decisions-log.md`.

## Current stack baseline
This section reflects the actual repository baseline and should be updated whenever the repo changes materially.

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Better Auth
- Prisma
- Stripe
- Vercel-first deployment assumptions

## Why this matters commercially
The starter is not selling "modern for modern's sake". It is selling a current, credible foundation. The stack must therefore be both:
- modern enough to feel premium,
- stable and understandable enough to avoid buyer anxiety.

## Core engineering principles
1. **Obvious beats clever**.
2. **Feature proximity beats excessive indirection**.
3. **Thin route layer, explicit server logic**.
4. **Remove abstraction until repetition proves it is needed**.
5. **Buyer customization speed is a first-class requirement**.
6. **Structure must remain sellable to a 149+ buyer, not just satisfying to the author**.
7. **The repository, not memory, is the source of truth for stack claims**.

## Default structural baseline
```txt
src/
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

Feature default:

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

## Code organization principles
- Keep `app/` thin and limited to routing and route composition.
- Put business logic in `features/`.
- Separate shared UI from feature UI.
- Use global `lib/` only for shared technical infrastructure.
- Keep database access out of server actions by default and place feature server logic in `server/`.
- Avoid custom meta-framework conventions that are not immediately legible.
- Preserve compatibility with current Next.js idioms instead of designing around outdated App Router constraints.

## Allowed sophistication
More structure can be justified in:
- billing,
- auth,
- workspaces and permissions,
- webhooks,
- external sync,
- background jobs,
- audit-sensitive flows.

Standard feature work should stay direct and local.

## Anti-patterns to avoid
- repositories or use-case layers everywhere by default,
- dependency injection as a general default,
- indirection that hides business logic from the feature itself,
- file explosion for simple flows,
- over-generalized abstractions before real reuse appears,
- magic configuration that is hard to trace,
- wrappers that create a framework-within-a-framework.

## Documentation requirement
Every major subsystem should be explained in docs sufficiently for:
- a buyer reading the repository,
- a collaborator joining the project,
- an AI assistant reasoning on top of the codebase.

At minimum, docs must clearly explain:
- auth and session model,
- billing and subscription flow,
- workspace model,
- environment variables,
- local setup,
- where to customize key UI and product flows.

## Open architecture questions
- Is Better Auth the right long-term auth baseline for the starter?
- Is Prisma still the best fit for the starter's buyer and hosting assumptions?
- Which AI-facing surface belongs in the core product versus optional modules?
