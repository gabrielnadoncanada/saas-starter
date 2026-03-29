# Anti-patterns
## 1. Heavy logic in `app/`
Bad:

```txt
app/
  dashboard/
    invoices/
      create-invoice.ts
      invoice-utils.ts
      page.tsx
      validation.ts
```

Problem:
- route composition and business logic are mixed
- route folders become hard to scan
- feature boundaries disappear

Prefer:
- keep route files in `app/`
- move business logic to `features/<feature>/`

## 2. Feature-local `lib/` as a catch-all
Bad:

```txt
features/
  auth/
    lib/
      auth-activity.ts
      current-user.ts
      linked-accounts.ts
      post-sign-in.ts
```

Problem:
- `lib/` says almost nothing
- pure helpers and server-only logic get mixed together

Prefer:
- `server/` for server-only logic
- `utils/` for pure helpers

## 3. Fake page components inside features
Bad:

```txt
features/
  auth/
    components/
      general-settings-page.tsx
      security-settings-page.tsx
```

Problem:
- `Page` strongly implies a route file
- conflicts with the Next.js mental model

Prefer:
- `general-settings-section.tsx`
- `security-settings-panel.tsx`
- `general-settings-form.tsx`

## 4. Too many folders too early
Bad:

```txt
features/
  invoices/
    actions/
    dto/
    mappers/
    policies/
    presenters/
    repositories/
    services/
    use-cases/
```

Problem:
- high cognitive overhead
- slow onboarding
- too much ceremony for small SaaS starters

Prefer:
- start with `actions/`, `components/`, `server/`, `schemas/`, `utils/`, `types/`
- add layers only when real complexity appears

## 5. Client fetch for simple initial form data
Bad:
- a settings form mounts
- fetches data already available on the server

Problem:
- unnecessary client complexity
- worse App Router usage

Prefer:
- fetch initial data in a server component
- pass it as props to the client form

## 6. Custom hooks for everything
Bad:
- `use-account-data.ts`
- `use-current-user-form.ts`
- `use-invoice-actions.ts`

Problem:
- hides simple logic
- increases indirection without real value

Prefer:
- plain functions when logic is not React-specific
- server components when data can be loaded on the server
- hooks only for real reusable client-side behavior

## 7. Root `components/` absorbing feature UI too early
Bad:

```txt
components/
  app/
    billing-plan-card.tsx
    delete-account-card.tsx
    invoice-filters.tsx
```

Problem:
- feature boundaries disappear
- root folders become dumping grounds

Prefer:
- keep feature UI inside the feature
- move to `components/app/` only when reuse is proven

## 8. Redundant `types/`
Bad:
- every local prop type moved to `types/`
- Zod-inferred types duplicated without reason

Problem:
- more files, less clarity
- maintenance overhead

Prefer:
- keep local types local
- use feature `types/` only for shared contracts

## 9. Root `lib/` holding feature business logic
Bad:

```txt
lib/
  auth-onboarding.ts
  customer-import.ts
  invoice-summary.ts
```

Problem:
- app-wide and feature-specific code are mixed
- the app becomes organized around technical leftovers instead of domains

Prefer:
- domain logic inside `features/<feature>/`
- `lib/` only for app-wide technical infrastructure

## 10. Prisma inside server actions
Bad:
- a server action parses input
- runs Prisma queries and transactions
- also handles business rules and `revalidatePath`

Problem:
- hard to test
- tightly coupled to Next.js

Prefer:
- keep the action thin
- move Prisma queries and feature server logic into `server/`

## 11. Architecture purity over usability
Bad mindset:
- optimize for theoretical cleanliness first
- add layers before complexity exists

Problem:
- harder onboarding
- slower delivery
- worse DX

Prefer:
- optimize for clarity, speed, and maintainability
- let abstraction follow actual complexity

## 12. `config/` files that are not really config
Bad:

```ts
export async function loadBillingConfig() {
  const products = await stripe.products.list();
  return products.map(/* ... */);
}
```

Problem:
- config becomes runtime orchestration
- mixes editable definitions with side effects

Prefer:
- keep editable definitions in `config/`
- move API calls and DB access to `server/`

## 13. App-wide config hidden in a feature
Bad:

```txt
features/
  billing/
    config/
      navigation.config.ts
```

Problem:
- ownership is misleading
- unrelated features depend on one feature folder

Prefer:
- move app-wide config to root `config/`
- keep feature `config/` scoped to one domain
