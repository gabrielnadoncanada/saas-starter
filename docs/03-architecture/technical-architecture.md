# Technical Architecture

## Purpose
Define the technical direction, conventions, and boundaries that keep the starter usable, understandable, and sellable.

## Architectural objective
Provide a codebase that is production-capable without becoming an internal framework that buyers must learn before being productive.

## Governing standards
- Use `nextjs-saas-structure` as the default standard for folder shape, code placement, and server/client boundaries.
- Use `starter-buyer-fit` as the default standard for judging whether a pattern is commercially appropriate for the target buyer.
- Any deviation from those defaults must be explained in `decisions-log.md`.

## Candidate stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase or equivalent database and auth stack
- Stripe for subscriptions
- Resend or equivalent transactional email provider
- Vercel-first deployment path

## Core engineering principles
1. **Obvious beats clever**.
2. **Feature proximity beats excessive indirection**.
3. **Thin route layer, explicit server logic**.
4. **Remove abstraction until repetition proves it is needed**.
5. **Buyer customization speed is a first-class requirement**.
6. **Structure must remain sellable to a 149+ buyer, not just satisfying to the author**.

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

## Allowed sophistication
More structure can be justified in:
- billing,
- auth,
- teams and permissions,
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
- an AI assistant being asked to modify or extend the code.

## Non-functional requirements
- fast local setup,
- deterministic env configuration,
- consistent naming,
- strong type safety on critical flows,
- minimal surprise when tracing a request.

## Open questions
- final decision on Supabase vs alternative backend path,
- exact team and workspace depth for V1,
- whether AI modules should be core or packaged separately.
