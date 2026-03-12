# Examples

## 1. Default app structure

Use this as the default starting point for a Next.js App Router SaaS project:

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

Notes:

- `app/` is for route composition only
- `features/` holds domain code
- `components/ui/` is base UI
- `components/shared/` is app-level reusable UI
- `lib/` is shared technical infrastructure
- `hooks/`, `types/`, `constants/` are optional

---

## 2. Default feature structure

For most business features, start here:

```txt
features/
  invoices/
    actions/
    components/
    server/
    schemas/
    utils/
    types/
```

Meaning:

- `actions/` -> server actions
- `components/` -> feature UI
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
        LoginForm.tsx
        MagicLinkForm.tsx
      settings/
        DeleteAccountCard.tsx
        GeneralSettingsForm.tsx
        GeneralSettingsSection.tsx
        LinkedAccountsCard.tsx
        SecuritySettingsPanel.tsx
        SecuritySettingsSection.tsx

    schemas/
      account.schema.ts

    server/
      auth-activity.ts
      complete-post-sign-in.ts
      current-user.ts
      linked-accounts.ts
      onboarding.ts

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
- route-level naming stays out of the feature
- feature-owned team lookups stay in `features/`, while low-level shared logging can stay in `lib/`

---

## 4. Billing feature example

```txt
features/
  billing/
    actions/
      create-checkout-session.action.ts
      open-customer-portal.action.ts

    components/
      BillingPlanCard.tsx
      BillingSection.tsx
      UsageCard.tsx

    server/
      billing-usage.ts
      current-subscription.ts
      create-checkout-session.ts
      open-customer-portal.ts

    schemas/
      billing.schema.ts

    types/
      billing.types.ts
```

Keep it compact.
Do not create extra folders unless the feature is actually growing.

---

## 5. Feature with no `types/` and no `utils/`

Many features do not need all folders.

```txt
features/
  feedback/
    actions/
      submit-feedback.action.ts
    components/
      FeedbackForm.tsx
    schemas/
      feedback.schema.ts
    server/
      submit-feedback.ts
```

This is perfectly acceptable.
Do not create `types/`, `hooks/`, or `utils/` just to complete a pattern.

---

## 6. Good route-to-feature composition

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
        GeneralSettingsSection.tsx
        SecuritySettingsSection.tsx
```

Example route files:

```tsx
// app/(dashboard)/settings/page.tsx
import { GeneralSettingsSection } from "@/features/auth/components/settings/GeneralSettingsSection";

export default function SettingsPage() {
  return <GeneralSettingsSection />;
}
```

```tsx
// app/(dashboard)/security/page.tsx
import { SecuritySettingsSection } from "@/features/auth/components/settings/SecuritySettingsSection";

export default function SecurityPage() {
  return <SecuritySettingsSection />;
}
```

Why this is good:

- real route files stay in `app/`
- feature components are named as sections, not pages
- business logic stays outside route files

---

## 7. Good server action split

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

Example responsibility split:

- `actions/create-invoice.action.ts`
  - validate input
  - get current user if needed
  - call server logic
  - revalidate or redirect
  - return small serializable result

- `server/create-invoice.ts`
  - query db
  - run feature-specific server logic
  - stay framework-light when possible

This is usually enough for an indie-friendly starter.

---

## 8. Good use of `components/shared/`

```txt
components/
  shared/
    DataTableToolbar.tsx
    EmptyState.tsx
    PageHeader.tsx
```

Use this for reusable app-level UI.
Do not move feature-specific cards or forms here too early.

---

## 9. Good use of `lib/`

```txt
lib/
  auth/
    auth.ts
    providers.ts
  db/
    prisma.ts
  payments/
    stripe.ts
  utils/
    format-date.ts
```

Use global `lib/` for infrastructure and generic cross-feature helpers.

Do not put feature-specific files such as:

- `invoice-summary.ts`
- `auth-onboarding.ts`
- `customer-import.ts`

Those belong in their features.

---

## 10. Good use of `utils/`

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

Bad candidates:

- prisma queries
- auth session logic
- server-only data fetching
- React hooks
