# Scaling

Use this file when the user asks how the structure should evolve as the app grows.

## 1) Small app

Recommended structure:

```txt
app/
features/
components/
  ui/
  shared/
lib/
```

Optional:

- `hooks/`
- `types/`
- `constants/`

Use this when:

- one developer
- few domains
- small surface area
- MVP or early product

Rule:

- keep the number of folders low
- do not create structure in advance

## 2) Medium app

Recommended structure:

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

Use this when:

- more features appear
- some reusable React behavior emerges
- more shared types/constants are justified

Rule:

- expand inside `features/` first
- only add global folders when reuse is real

## 3) Larger app

Recommended approach:

- keep the same top-level structure
- add more internal structure inside features
- improve naming and boundaries before adding new architecture

Examples of internal growth:

```txt
features/
  invoices/
    components/
    actions/
    schemas/
    lib/
    types/
    hooks/
    constants/
```

Rule:

- scale inward before scaling outward

## 4) When not to add more architecture

Do not add new layers just because the app is bigger.

Size alone does not justify:

- `domain/`
- `application/`
- `repositories/`
- `use-cases/`

Add them only if the product has real complexity that cannot be managed with the simpler feature structure.

## 5) Default scaling advice

As the app grows:

1. keep `app/` thin
2. keep business logic inside features
3. improve feature internals
4. keep shared folders generic
5. add complexity only after repeated pressure

## 6) Core principle

A growing app should usually gain:

- better boundaries
- clearer naming
- stronger feature ownership

It should not automatically gain:

- more abstraction
- more layers
- more folders at the root
