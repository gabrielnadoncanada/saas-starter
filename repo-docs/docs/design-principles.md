# Design Principles

## 1. Optimize for time to understand
A competent Next.js developer should understand where code lives and how features flow without heavy documentation.

## 2. Optimize for time to modify
Common changes should feel direct:
- add a CRUD entity
- change a dashboard section
- extend billing or plans
- add a gated feature
- tweak onboarding or settings

## 3. Prefer obviousness over purity
A structurally elegant pattern is not automatically valuable if it slows down comprehension.

## 4. Keep boundaries, remove ceremony
Thin boundaries are good. Extra wrappers, layers, and indirections are bad unless complexity clearly earns them.

## 5. Avoid framework-within-a-framework drift
The starter must feel like a clean app, not a system buyers must learn before building.

## 6. Reward visible value
Prefer improvements buyers notice quickly:
- better dashboard credibility
- clearer settings
- easier customization
- better billing and gating extensibility
- stronger docs

## 7. Make complexity earn structure
Higher structure is justified mainly in:
- billing
- auth
- permissions
- webhooks
- external sync
- audit-sensitive flows
