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

---

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
- imports become harder to reason about

Prefer:
- `server/` for server-only logic
- `utils/` for pure helpers

---

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
- conflicts with Next.js mental model
- confuses future maintainers

Prefer:
- `general-settings-section.tsx`
- `security-settings-panel.tsx`
- `general-settings-form.tsx`

Reserve actual `page.tsx` for `app/`.

---

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
- template becomes harder to sell and adopt

Prefer:
- start with `actions/`, `components/`, `server/`, `schemas/`, `utils/`, `types/`
- only add layers when real complexity appears

---

## 5. Client fetch for simple initial form data

Bad:
- a settings form mounts
- calls SWR or fetches `/api/user`
- only to populate initial fields already available on the server

Problem:
- unnecessary client complexity
- worse App Router usage
- slower and noisier code

Prefer:
- fetch initial data in a server component
- pass it as props to the client form

---

## 6. Custom hooks for everything

Bad:
- `use-account-data.ts`
- `use-current-user-form.ts`
- `use-invoice-actions.ts`
- each only wraps one fetch or one function

Problem:
- hides simple logic
- spreads behavior across too many files
- increases indirection without real value

Prefer:
- plain functions when logic is not React-specific
- server components when data can be loaded on the server
- hooks only for real reusable client-side behavior

---

## 7. Root shared folder absorbing feature UI too early

Bad:

```txt
shared/
  components/
    app/
      billing-plan-card.tsx
      delete-account-card.tsx
      invoice-filters.tsx
```

Problem:
- feature boundaries disappear
- shared folder becomes a dumping ground
- reusability is assumed too early

Prefer:
- keep feature UI inside the feature
- move to `shared/components/app/` only when reuse is proven

---

## 8. Redundant `types/`

Bad:
- every local prop type moved to `types/`
- Prisma model aliases copied with no added meaning
- Zod-inferred types duplicated without reason

Problem:
- more files, less clarity
- false sense of structure
- maintenance overhead

Prefer:
- keep local types local
- use feature `types/` only for shared contracts
- keep the folder small

---

## 9. `shared/lib/` holding feature business logic

Bad:

```txt
shared/
  lib/
    auth-onboarding.ts
    customer-import.ts
    invoice-summary.ts
```

Problem:
- cross-feature and feature-specific code are mixed
- the app becomes organized around technical leftovers instead of domains

Prefer:
- domain logic inside `features/<feature>/`
- `shared/lib/` only for app-wide technical infrastructure

---

## 10. Prisma inside server actions

Bad:
- a server action parses input
- runs several Prisma queries and transactions
- contains business rules and response mapping
- also calls `revalidatePath` or `redirect`

Problem:
- hard to test
- tightly coupled to Next.js
- reusable domain logic gets trapped at the framework boundary

Prefer:
- keep the action thin
- move Prisma queries, transactions, and feature server logic into `server/`
- let the action handle only the boundary concerns

---

## 11. Architecture purity over usability

Bad mindset:
- optimize for theoretical cleanliness first
- add layers before complexity exists
- force every feature into the same advanced pattern

Problem:
- harder onboarding
- slower delivery
- worse DX
- poorer template usability for indies

Prefer:
- optimize for clarity, speed, and maintainability
- let abstraction follow actual complexity

---

## 12. `config/` files that are not really config

Bad:

```txt
features/
  billing/
    config/
      billing.config.ts
```

```ts
export async function loadBillingConfig() {
  const products = await stripe.products.list();
  return products.map(/* ... */);
}
```

Problem:
- config becomes runtime orchestration
- file stops being predictable to edit
- mixes static definitions with external API work

Prefer:
- keep editable definitions in `config/`
- move API calls, DB access, and side effects to `server/`

---

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
- future edits become harder to reason about

Prefer:
- move app-wide config to `shared/config/`
- keep feature `config/` scoped to one domain
