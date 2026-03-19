# Decisions Log

## 2026-03-15 - Optimize for buyer value over architectural purity
### Decision
Default to pragmatic structure and commercially legible code rather than advanced abstractions.

### Why
The buyer's main job is to adapt and ship, not admire architecture.

### Alternatives rejected
- enterprise-style layering by default,
- highly abstract framework-like structure.

### Consequences
Engineering choices must be justified by buyer value, not elegance alone.

---

## 2026-03-15 - Position around launch speed and monetization readiness
### Decision
Frame the starter as a monetization-ready SaaS foundation rather than a generic modern stack template.

### Why
This increases commercial clarity and differentiates the product from low-value generic starters.

### Alternatives rejected
- positioning as an all-purpose Next.js template,
- positioning around technical novelty alone.

### Consequences
The feature set and messaging must reinforce auth, billing, onboarding, dashboard, and documentation quality.

---

## 2026-03-15 - Lock pricing floor at 149 USD
### Decision
Do not price the product below 149 USD.

### Why
Pricing below this threshold increases the risk of signaling a cheap boilerplate instead of a premium, time-saving product.

### Alternatives rejected
- sub-100 USD pricing,
- treating low price as the main growth lever.

### Consequences
The product, docs, and UI quality must support premium perception from the first impression.

---

## 2026-03-15 - Adopt `nextjs-saas-structure` as the default structural standard
### Decision
Use `nextjs-saas-structure` as the default reference for folder shape, code placement, and server/client boundaries.

### Why
It matches the intended buyer: pragmatic, speed-focused, and unwilling to learn an internal framework first.

### Alternatives rejected
- inventing a custom structure in project docs,
- using enterprise layering as the default baseline.

### Consequences
Structure decisions should default to thin `app/`, feature-owned logic, shared UI separation, and pragmatic boundaries.

---

## 2026-03-15 - Adopt `starter-buyer-fit` as the default abstraction filter
### Decision
Use `starter-buyer-fit` as the standard for judging whether a technical decision is appropriate for the target buyer.

### Why
A structurally valid pattern can still be commercially overbuilt for solo founders and small technical teams.

### Alternatives rejected
- judging decisions only by code cleanliness,
- optimizing for theoretical architecture purity.

### Consequences
Patterns such as repositories, dependency injection, and extra wrapper layers require stronger justification and will usually be rejected in ordinary feature work.

---

## 2026-03-15 - Keep workspace foundation in V1
### Decision
Include a base workspace or team foundation in V1.

### Why
It increases perceived value, better matches B2B SaaS expectations, and strengthens the economic case for a 149+ purchase.

### Alternatives rejected
- shipping only single-user account structure in V1,
- moving all team concepts to Pro.

### Consequences
The V1 build must include a minimal but clear workspace model without drifting into a complex RBAC matrix.

---

## 2026-03-15 - Correct the documented stack baseline to match the repository
### Decision
Treat the current starter baseline as a Next.js 16 and React 19 codebase with Prisma, Stripe, Tailwind 4, and Better Auth.

### Why
Outdated stack claims reduce trust and lead to wrong product, build, and messaging decisions.

### Alternatives rejected
- continuing to describe the project as an older Next.js baseline,
- allowing documentation to drift away from the repository.

### Consequences
Technical docs, roadmap language, and sales messaging must reflect the actual current stack and avoid legacy framing.

---

## Pending decisions
- final auth posture for V1 versus long-term,
- exact Starter vs Pro split,
- which AI-native modules belong in V1,
- update and support policy.
