---
name: starter-buyer-fit
description: evaluate and shape code, architecture, abstractions, and product-facing conventions for a next.js saas starter aimed at shipfast-style indies and small technical teams. use when reviewing a starter, deciding whether an abstraction is acceptable, calibrating simplicity versus sophistication, translating buyer expectations into code or architecture choices, or complementing nextjs-saas-structure without repeating its folder and boundary guidance.
---

# Starter Buyer Fit

## Overview

Use this skill to keep a SaaS starter aligned with the buyer it is meant to serve: a technical founder or very small technical team that wants to ship quickly, understand the code quickly, and modify features without learning an internal framework first.

This skill complements `nextjs-saas-structure`. Do not repeat its folder-placement guidance, feature structure defaults, or `actions/` versus `server/` boundary rules. Use that skill for *where code should live*. Use this skill for *why a decision fits or misses the target buyer*.

## Core stance

Assume the starter is being sold to:
- a solo founder
- a two-to-five person technical team
- a pragmatic indie builder
- a consultant or freelancer launching client-facing SaaS quickly

Assume the buyer is **not**:
- an enterprise team optimizing for maximum internal architecture purity
- a buyer looking for strict clean architecture or DDD
- someone willing to learn a mini-framework before editing features

Optimize for:
- time to understand
- time to modify
- time to ship
- visible quality
- predictable conventions
- low cognitive overhead

Treat invisible sophistication with suspicion unless the complexity is obvious and justified.

## How to complement `nextjs-saas-structure`

When both skills are relevant:
1. use `nextjs-saas-structure` to decide the file and folder shape
2. use this skill to judge whether the chosen abstraction level matches the buyer
3. do not restate generic structure guidance unless the buyer-fit judgment depends on it
4. explicitly say when something is structurally valid but commercially overbuilt for this audience

Example:
- `nextjs-saas-structure` may support thin actions plus feature `server/` logic
- this skill decides whether added dependency injection, repositories, or wrapper layers are worth the buyer-facing cost

## Buyer model

The buyer is purchasing:
- a shortcut to a launchable SaaS foundation
- fewer hours lost on auth, billing, teams, and settings
- a codebase that feels premium without feeling corporate
- confidence that common changes will be fast

The buyer is not primarily purchasing:
- theoretical architecture
- advanced testability as a selling point
- invisible correctness work they cannot perceive quickly
- a large set of internal conventions to memorize

## Translation rules

Translate the buyer model into code and architecture with these defaults:

### 1. Prefer obviousness over purity
Prefer code that is immediately understandable to a competent Next.js developer.
Reject abstractions that need explanation before they save time.

### 2. Keep boundaries, remove ceremony
Thin server actions and feature-owned server logic are usually a good fit.
Extra layers around those boundaries are not automatically a good fit.

### 3. Judge abstractions by perceived payoff
Ask:
- will the buyer notice why this exists?
- will this reduce time-to-modify for most buyers?
- would a new owner understand the flow in under a minute?

If not, the abstraction is likely too expensive.

### 4. Let complexity earn structure
Accept more structure in:
- billing
- auth
- teams and permissions
- webhooks
- external sync
- background jobs
- audit-sensitive flows

Keep standard feature work direct and local.

### 5. Avoid framework-within-a-framework drift
A starter should feel like a clean app, not like a platform the buyer must first learn.

## Review workflow

When evaluating code, architecture, or a proposal, use this sequence:

1. identify the buyer-facing job
   - what will the buyer try to change first?
   - what kind of developer will open this file?

2. identify the complexity class
   - simple CRUD or settings flow
   - moderate workflow with business rules
   - high-complexity infrastructure or billing flow

3. assess the abstraction level
   - direct and obvious
   - structured but still pragmatic
   - borderline ceremony
   - enterprise-leaning overbuild

4. give a verdict in buyer language
   - acceptable
   - acceptable but slightly sophisticated
   - borderline for this audience
   - too much for this audience

5. recommend the smallest correction
   - remove a layer
   - inline a helper
   - keep the split but drop the extra wrapper
   - keep the structure because the complexity justifies it

## Default verdict framework

### Acceptable
Use for decisions that:
- reduce repetition clearly
- preserve quick comprehension
- keep feature ownership obvious
- match common expectations of modern Next.js SaaS starters

Typical examples:
- thin actions
- feature-owned server functions
- Zod schemas
- shared UI primitives
- small auth or action wrappers with obvious behavior

### Acceptable but slightly sophisticated
Use for decisions that are still sellable and reasonable, but add some cognitive overhead.

Typical examples:
- a light helper around repeated action validation
- a small reusable mapper with clear naming
- a modest split in a complex billing feature

Say explicitly that the choice is fine, but should not become the default everywhere.

### Borderline for this audience
Use for decisions that may be technically sound but weak in perceived value.

Typical examples:
- dependency injection in ordinary feature flows
- very granular type scaffolding around simple database access
- too many support files for a feature with little real complexity

Recommend simplification while preserving the useful boundaries.

### Too much for this audience
Use for decisions that make the starter feel enterprise-heavy or slow to edit.

Typical examples:
- repositories by default
- use-cases everywhere
- command handlers for ordinary feature work
- multiple internal layers before reaching business logic
- patterns that require documentation before modification

## Heuristics for common architecture choices

### Thin actions plus `server/`
Usually a strong fit.
This is one of the best defaults for this buyer because it keeps framework boundaries clear without adding much ceremony.

### Dependency injection
Do not make it the default in ordinary feature logic.
It may be justified in a few high-complexity or highly reusable infrastructure flows, but it usually adds more perceived cost than value in a starter sold to indies.

### Typed dependency objects
Treat with skepticism unless there is a clear, repeated need.
If the only justification is test elegance, and testability is not a marketed differentiator, prefer direct imports.

### Shared wrappers
Allow only when their behavior is obvious and repeatedly useful.
A wrapper should remove friction, not create a local framework.

### Local feature helpers
Good when they remove duplication without hiding the main flow.
Bad when they fragment a simple operation into too many files.

### Global abstractions
Use sparingly.
If a pattern is not truly cross-feature and persistent, keep it local to the feature.

## Response style for this skill

When using this skill:
- lead with the verdict
- explain the buyer impact, not only the technical pattern
- be explicit when something is structurally valid but commercially overbuilt
- recommend the smallest simplification that preserves clarity
- avoid repeating generic folder advice already covered by `nextjs-saas-structure`

Good phrasing patterns:
- "Structurally sound, but slightly too sophisticated for a ShipFast-style buyer."
- "Good boundary, unnecessary ceremony."
- "Keep the split, drop the abstraction."
- "This is clean for you, but not obviously valuable to the buyer."

## Output format

When reviewing something concrete, use this structure:

1. verdict
2. why it fits or misses the buyer
3. what to keep
4. what to simplify
5. the smallest better version

Keep the advice practical and product-aware.

## Resources

Use these references when needed:
- `references/decision-rules.md` for deeper decision rules
- `references/examples.md` for before/after examples and judgments
