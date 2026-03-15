# MVP Scope

## Purpose
Define what V1 includes, what it excludes, and how future scope decisions should be made.

## Scope principle
V1 should include only the modules that materially improve a buyer's ability to launch and monetize quickly while preserving a premium, understandable experience.

## In scope for V1
### Core platform
- Next.js app foundation
- authentication
- protected dashboard shell
- database schema and migrations
- environment configuration
- seed data

### Monetization
- Stripe subscription flow
- pricing page
- billing portal access
- subscription-aware UI and route protection

### Product basics
- account settings
- workspace or team foundation in base V1
- onboarding flow
- landing page included
- email foundation for transactional flows

### Developer experience
- clear documentation
- folder conventions aligned with `nextjs-saas-structure`
- setup guide
- customization guide
- decision log and technical rationale

### Quality perception
- polished design system
- sane defaults for navigation, forms, empty states, and dashboard views

## Explicitly out of scope for V1
- every possible auth provider,
- complex RBAC matrix,
- advanced analytics suite,
- marketplace logic,
- CRM-level modules,
- full internationalization unless core to positioning,
- elaborate AI agents unless they directly support the product promise,
- over-generalized plugin systems,
- enterprise-style abstraction layers.

## Candidate Pro add-ons
- advanced roles and permissions,
- admin panel,
- audit logs,
- AI starter modules with clearer payoff,
- advanced onboarding variants,
- API scaffolding,
- premium templates or blocks,
- support for multiple payment products.

## Feature acceptance criteria
A feature should be included only if at least one of the following is true:
1. it materially reduces time-to-launch,
2. it materially improves perceived value and conversion,
3. it removes a common high-risk integration problem,
4. it strengthens the product's unique positioning,
5. it supports the product feeling credibly worth 149 USD or more.

## Feature rejection criteria
Reject or postpone a feature if:
- it exists mainly to impress technically,
- it adds major complexity for limited buyer value,
- it serves a niche use case,
- it requires buyers to learn a custom framework.

## Current recommendation
V1 should target the highest-confidence path: a premium B2B SaaS starter with auth, billing, polished dashboard, workspace foundation, docs, and a strong customization story.

## Open questions
- Which exact workspace capabilities are necessary in base V1?
- Which AI-native elements belong in V1 versus Pro?
