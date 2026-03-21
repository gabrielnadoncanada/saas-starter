# Examples

## 1. Default app structure

Use this as the default starting point for a Next.js App Router SaaS project:

```txt
app/
features/
shared/
  components/
    ui/
    app/
  config/
  lib/
  hooks/
  types/
  constants/
```

Notes:

- `app/` is for route composition only
- `features/` holds domain code
- `shared/components/ui/` is base UI
- `shared/components/app/` is app-level reusable UI
- `shared/config/` is app-wide editable configuration
- `shared/lib/` is shared technical infrastructure
- `shared/hooks/`, `shared/types/`, `shared/constants/`, and `shared/config/` are optional

---

## 2. Default feature structure

For most business features, start here:

```txt
features/
  invoices/
    actions/
    components/
    config/
    server/
    schemas/
    utils/
    types/
```

Meaning:

- `actions/` -> server actions
- `components/` -> feature UI
- `config/` -> feature-owned editable configuration
- `server/` -> server-only data and feature logic
- `schemas/` -> zod validation
- `utils/` -> pure feature helpers
- `types/` -> shared feature contracts

Only add folders when needed.

---

## 3. Auth feature example

```txt
features/
  auth/
    actions/
      delete-account.action.ts
      unlink-auth-provider.action.ts
      update-account.action.ts
    components/
      login/
        login-form.tsx
      settings/
        delete-account-card.tsx
        general-settings-form.tsx
        general-settings-section.tsx
        linked-accounts-card.tsx
    schemas/
      account.schema.ts
    server/
      auth-activity.ts
      complete-post-sign-in.ts
      current-user.ts
      linked-accounts.ts
    types/
      auth.types.ts
    utils/
      post-sign-in.ts
```

Why this is good:

- auth UI is grouped by sub-area
- server-only code is easy to spot
- schemas stay separate from types
- the feature has no ambiguous local `lib/`
- low-level shared logging can stay in `shared/lib/`

---

## 4. Good route-to-feature composition

```txt
app/
  (dashboard)/
    settings/
      page.tsx
    security/
      page.tsx

features/
  auth/
    components/
      settings/
        general-settings-section.tsx
        security-settings-section.tsx
```

Example route file:

```tsx
import { GeneralSettingsSection } from "@/features/auth/components/settings/general-settings-section";

export default function SettingsPage() {
  return <GeneralSettingsSection />;
}
```

Why this is good:

- route files stay in `app/`
- feature components are named as sections, not pages
- business logic stays outside route files

---

## 5. Good server action split

```txt
features/
  invoices/
    actions/
      create-invoice.action.ts
    server/
      create-invoice.ts
    schemas/
      invoice.schema.ts
```

Responsibility split:

- `actions/` validates input, resolves auth, and handles Next.js boundary concerns
- `server/` owns Prisma queries and feature server logic

---

## 6. Good use of `shared/components/app/`

```txt
shared/
  components/
    app/
      data-table-toolbar.tsx
      empty-state.tsx
      page-header.tsx
```

Use this for reusable app-level UI.
Do not move feature-specific cards or forms here too early.

---

## 7. Good use of `shared/lib/`

```txt
shared/
  lib/
    auth/
      auth.ts
      providers.ts
    db/
      prisma.ts
    payments/
      stripe.ts
```

Use `shared/lib/` for infrastructure and generic cross-feature helpers.

Do not put feature-specific files such as:

- `invoice-summary.ts`
- `auth-onboarding.ts`
- `customer-import.ts`

Those belong in their features.

---

## 8. Good use of feature `utils/`

```txt
features/
  auth/
    utils/
      post-sign-in.ts
```

Good candidates:

- URL builders
- formatting helpers scoped to one feature
- small pure mappers
- feature-local helper functions with no DB or framework coupling

---

## 9. Good use of feature `config/`

```txt
features/
  billing/
    config/
      billing.config.ts
    server/
      create-checkout-session.ts
      handle-subscription-change.ts
```

Use feature `config/` for explicit domain configuration that a developer is likely to edit directly.

Good candidates:

- plan definitions
- capability matrices
- role definitions for one feature
- feature navigation sections

Keep workflows and side effects in `server/`, not in `config/`.

---

## 10. Good use of `shared/config/`

```txt
shared/
  config/
    navigation.config.ts
    marketing.config.ts
  lib/
    auth/
    db/
```

Use `shared/config/` for app-wide configuration that is not owned by a single feature.

Good candidates:

- dashboard navigation
- marketing site sections
- app shell menus
- global product labels used across multiple features
