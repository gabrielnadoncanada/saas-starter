# SaaS Starter Documentation Index

## Purpose
This documentation system is the operating system for the SaaS starter product. It converts scattered ideas into durable decisions, clear scope, and executable work.

## Source of truth
- Chat is for exploration.
- Docs are for decisions.
- No important product or technical decision should remain only in conversation.
- `nextjs-saas-structure` is the default structural standard for code placement and boundaries.
- `starter-buyer-fit` is the default buyer-fit standard for judging whether an abstraction is sellable to the target customer.
- The repository is the source of truth for the actual runtime stack and implementation state.

## Document map

### 01-strategy
- `vision.md` - why this product exists, the market problem, the positioning, and strategic constraints.
- `ideal-customer-profile.md` - who the product is for, what they want, what blocks them, and what makes them buy.

### 02-product
- `value-proposition.md` - the commercial value delivered, differentiators, alternatives, and buyer outcomes.
- `mvp-scope.md` - what is in V1, what is explicitly out of scope, and how feature decisions are made.
- `v1-blueprint.md` - the official build blueprint for the sellable V1, including modules, sequencing, and tier split.

### 03-architecture
- `technical-architecture.md` - stack, conventions, system boundaries, and non-negotiable engineering principles.
- `decisions-log.md` - lightweight architecture and product decision records.

### 04-marketing-sales
- `offer.md` - packaging, pricing direction, licensing, support, and commercial framing.
- `messaging.md` - positioning language, headlines, proof angles, objections, and voice.

### 05-execution
- `roadmap.md` - phased execution plan, milestones, dependencies, and risks.
- `tasks.md` - live backlog of next actions.

### 99-reference
- reserved for glossaries, templates, prompts, naming conventions, screenshots, reusable references, and extracted standards from skills when needed.

## Governance rules
1. Every major decision must be reflected in an existing doc or a new doc.
2. Each doc must remain concise, explicit, and structured.
3. Each discussion with AI should end in one of three outcomes:
   - update an existing doc,
   - create a new doc,
   - create an execution task.
4. Open questions must be tracked explicitly instead of being hidden in prose.
5. When a structural decision is being made, default to `nextjs-saas-structure` unless there is a documented reason to deviate.
6. When an abstraction or pattern is being evaluated, default to `starter-buyer-fit` unless there is a documented reason to deviate.
7. When stack claims appear in docs or marketing, they must match the repository.

## Recommended reading order for a new collaborator
1. `01-strategy/vision.md`
2. `01-strategy/ideal-customer-profile.md`
3. `02-product/value-proposition.md`
4. `02-product/mvp-scope.md`
5. `02-product/v1-blueprint.md`
6. `03-architecture/technical-architecture.md`
7. `04-marketing-sales/offer.md`
8. `05-execution/roadmap.md`

## Current status
- Documentation system initialized.
- Pricing floor locked at 149 USD.
- Structural standard locked to `nextjs-saas-structure`.
- Buyer-fit standard locked to `starter-buyer-fit`.
- Product direction narrowed to an AI-native but pragmatic Next.js SaaS starter for solo founders and small technical teams.
- Stack baseline corrected to the current repository reality: Next.js 16, React 19, Prisma, Stripe, Tailwind 4, and Better Auth.
- Next step: turn the V1 blueprint into a build sequence and update the public-facing sales assets.
