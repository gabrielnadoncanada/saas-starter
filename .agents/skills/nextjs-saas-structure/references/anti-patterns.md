# Anti-patterns

Use this file to identify common structural mistakes in Next.js App Router SaaS codebases.

## 1) Putting too much in `app/`

Bad pattern:

- business logic inside route files
- validation logic inside `page.tsx`
- large data transformation inside layout files
- feature orchestration inside `app/`

Why it is bad:

- route files become heavy
- logic becomes hard to reuse
- routing concerns and business concerns get mixed

Better:

- keep `app/` for routing and composition
- move business logic into `features/`

## 2) Using global folders for everything

Bad pattern:

```txt
components/
hooks/
services/
utils/
schemas/
```

Why it is bad:

- feature code gets scattered
- business logic becomes harder to trace
- scaling increases cognitive load

Better:

- group business logic inside `features/<feature>/`

## 3) Treating `lib/` as a junk drawer

Bad pattern:

- random business functions inside global `lib/`
- feature-specific mappers in root `lib/`
- mixed technical and domain helpers in one place

Why it is bad:

- unclear ownership
- poor discoverability
- weak boundaries

Better:

- global technical code -> `lib/`
- feature-specific pure helpers -> `features/<feature>/lib/`

## 4) Putting feature logic in shared UI

Bad pattern:

- shared components importing invoice-specific logic
- business conditions embedded in generic table wrappers
- domain rules inside `components/shared/`

Why it is bad:

- shared UI stops being reusable
- feature coupling increases
- maintenance gets harder

Better:

- keep shared UI generic
- keep domain logic inside features

## 5) Creating hooks for non-hook logic

Bad pattern:

```ts
export function useCalculateTax() {}
```

Why it is bad:

- misleading naming
- confusion about React behavior
- logic is harder to classify correctly

Better:

- hooks only for reusable React behavior
- pure functions go in `lib/`

## 6) Mixing naming styles

Bad pattern:

- `invoice.schema.ts`
- `invoice-mapper.ts`
- `InvoiceTypes.ts`
- `useinvoicefilters.ts`

Why it is bad:

- naming becomes inconsistent
- responsibility is harder to read quickly
- codebase feels fragmented

Better:

- one naming style per responsibility
- consistent suffixes

## 7) Over-architecting too early

Bad pattern:

```txt
domain/
application/
infrastructure/
repositories/
use-cases/
```

Why it is bad:

- heavy upfront complexity
- slower iteration
- more ceremony than value for most SaaS starters

Better:

- start with `app/`, `features/`, `components/`, `lib/`
- add complexity only after repeated need

## 8) Too many top-level folders

Bad pattern:

```txt
actions/
schemas/
mappers/
services/
constants/
repositories/
ui/
hooks/
helpers/
```

Why it is bad:

- weak domain grouping
- poor discoverability
- difficult navigation

Better:

- keep most business logic inside feature folders
- use top-level folders only for truly shared concerns

## 9) Feature folders with no clear internal rules

Bad pattern:

```txt
features/
  invoices/
    random-file.ts
    helper.ts
    invoiceThing.ts
    test2.ts
```

Why it is bad:

- no predictable structure
- harder onboarding
- harder refactoring

Better:

```txt
features/
  invoices/
    components/
    actions/
    schemas/
    lib/
    types/
    hooks/
```

## 10) Default recommendation

When reviewing a structure, fix these problems first:

1. move business logic out of `app/`
2. regroup scattered business code inside `features/`
3. clean naming inconsistencies
4. move feature-specific code out of shared folders
5. remove unnecessary architectural layers
