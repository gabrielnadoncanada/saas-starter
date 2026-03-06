# Examples

Use these examples as default structure references when the user asks how to organize a Next.js App Router SaaS project.

## 1) Small SaaS starter

Use this for:

- MVPs
- solo projects
- early-stage products
- limited domain complexity

```txt
app/
  (marketing)/
    page.tsx
    pricing/
      page.tsx
  (dashboard)/
    dashboard/
      page.tsx
  api/
    stripe/
      webhook/
        route.ts
  layout.tsx
  page.tsx

features/
  auth/
    components/
    actions/
    schemas/
    types/
  invoices/
    components/
    actions/
    schemas/
    lib/
    types/

components/
  ui/
  shared/

lib/
  auth/
  stripe/
  supabase/
  utils/

hooks/
types/
constants/
```

### Why this structure works

- `app/` stays focused on routing
- `features/` contains business logic
- shared UI stays outside features
- technical infrastructure stays in `lib/`
- enough structure without enterprise overhead

## 2) Medium SaaS app

Use this for:

- several business domains
- multiple dashboards or sections
- more shared internal logic
- growing team collaboration

```txt
app/
  (marketing)/
    page.tsx
    pricing/
      page.tsx
  (dashboard)/
    dashboard/
      page.tsx
    invoices/
      page.tsx
    customers/
      page.tsx
    settings/
      page.tsx
  api/
    stripe/
      webhook/
        route.ts
    ai/
      generate/
        route.ts
  layout.tsx
  page.tsx

features/
  auth/
    components/
    actions/
    schemas/
    hooks/
    types/

  invoices/
    components/
    actions/
    schemas/
    lib/
    hooks/
    types/

  customers/
    components/
    actions/
    schemas/
    lib/
    hooks/
    types/

  billing/
    components/
    actions/
    lib/
    types/

  dashboard/
    components/
    lib/

components/
  ui/
  shared/
    page-header/
    data-table/
    empty-state/

lib/
  auth/
  db/
  stripe/
  supabase/
  ai/
  utils/

hooks/
  useDebounce.ts
  useMediaQuery.ts

types/
constants/
```

### Why this structure works

- each domain has its own logic
- shared app-level UI is separated from feature UI
- generic hooks remain global
- feature-specific hooks stay inside the feature
- still simple enough to navigate quickly

## 3) Larger SaaS app without full clean architecture

Use this for:

- large feature surface
- multiple contributors
- many shared conventions
- need for more internal consistency
- still no need for enterprise layering

```txt
app/
  (marketing)/
  (dashboard)/
    dashboard/
      page.tsx
    invoices/
      page.tsx
    customers/
      page.tsx
    subscriptions/
      page.tsx
    analytics/
      page.tsx
    settings/
      page.tsx
  api/
    stripe/
      webhook/
        route.ts
    uploads/
      route.ts
    ai/
      route.ts
  layout.tsx
  page.tsx

features/
  auth/
    components/
    actions/
    schemas/
    hooks/
    lib/
    types/

  invoices/
    components/
    actions/
    schemas/
    hooks/
    lib/
    types/
    constants/

  customers/
    components/
    actions/
    schemas/
    hooks/
    lib/
    types/

  billing/
    components/
    actions/
    hooks/
    lib/
    types/

  analytics/
    components/
    actions/
    hooks/
    lib/
    types/

  settings/
    components/
    actions/
    schemas/
    lib/
    types/

components/
  ui/
  shared/
    data-table/
    dialogs/
    layout/
    feedback/
    navigation/

lib/
  auth/
  db/
  stripe/
  supabase/
  ai/
  telemetry/
  permissions/
  utils/

hooks/
  useDebounce.ts
  useMediaQuery.ts
  useLocalStorage.ts

types/
constants/
```

### Why this structure works

- business domains remain isolated
- shared infrastructure is centralized
- no artificial layering is introduced
- each feature can scale internally without polluting the whole app

## Structure selection rule

Use this rule:

- small project -> keep the structure minimal
- medium project -> expand inside `features/`
- larger project -> add clarity inside each feature, not more top-level architecture

Do not add new root folders unless there is a repeated need.

## Default recommendation

When unsure, recommend this:

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

Then adapt only if the user has a concrete reason.
