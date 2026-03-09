# Scaling guidance

## Principle

Start simple.
Add structure only when the current structure creates real friction.

Do not scale architecture preemptively.

---

## Stage 1: Small starter or template

Recommended structure:

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

Typical characteristics:
- one or two developers
- small number of business flows
- limited team surface
- speed matters more than architectural ceremony

At this stage:
- keep actions thin
- keep server logic close to the feature
- avoid repositories and use-cases by default
- avoid shared abstractions too early

---

## Stage 2: Growing feature

Signs the feature is growing:
- many server files with unrelated responsibilities
- repeated logic across multiple actions
- multiple components relying on the same derived data
- the feature becomes hard to scan

Good responses:
- split `components/` into subfolders by UI area
- split `server/` into clearer files by responsibility
- extract repeated pure helpers into `utils/`
- add `types/` only when shared contracts are clearly reused

Example:

```txt
features/
  auth/
    components/
      login/
      settings/
    server/
      current-user.ts
      linked-accounts.ts
      onboarding.ts
```

This is usually enough before introducing deeper patterns.

---

## Stage 3: Repeated business workflows

Introduce extra abstraction only when one of these is true:
- the same server business flow is reused in several places
- the feature has non-trivial orchestration across several steps
- testing is painful because framework logic and business logic are tightly coupled
- the team explicitly wants a stricter architecture

At that point, consider carefully adding:
- `services/`
- `use-cases/`
- `mappers/`

But add only what solves a current problem.

Do not add full enterprise layering automatically.

---

## Good trigger for a use-case

A use-case may be justified when:
- the flow is multi-step
- the logic is reused
- there are several business rules
- the code should be testable independently from Next.js

Examples:
- `accept-team-invitation.ts`
- `complete-post-sign-in.ts`
- `create-subscription-checkout.ts`

A use-case is usually not justified for:
- simple lookups
- one-step form updates
- small mutations with minimal logic
- trivial CRUD wrappers

---

## Good trigger for `components/shared/`

Move a component from a feature to `components/shared/` only when:
- it is reused by multiple features
- the UI concept is truly app-level
- it carries no feature-specific business assumptions

Examples of good shared candidates:
- `ConfirmDialog`
- `DataTableToolbar`
- `EmptyState`
- `PageHeader`

Examples of bad early moves:
- `BillingPlanCard`
- `DeleteAccountCard`
- `InvoiceStatusFilter`

---

## Good trigger for global `hooks/`

Move a hook to global `hooks/` only when:
- it is reused across features
- it is genuinely app-wide React behavior
- it is not tied to one business domain

Otherwise keep it inside the feature or do not create it at all.

---

## Good trigger for global `types/`

Use global `types/` only when:
- a type is shared across several domains
- it is not owned by one feature
- it clearly belongs at the application level

Otherwise keep the type inside the feature that owns it.

---

## Scaling summary

Start with:
- thin `app/`
- feature-first structure
- compact folders
- clear server/client boundaries

Scale by:
- splitting by responsibility
- extracting repeated logic
- promoting only proven shared code

Avoid:
- creating architecture for hypothetical future complexity
- copying enterprise patterns into indie starters too early
