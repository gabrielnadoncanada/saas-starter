---
name: saas-starter-iteration-loop
description: audit and iterate on a next.js saas starter until it becomes easier to sell to solo founders, consultants, and small technical teams. use when reviewing an audit from a coding agent, converting findings into a prioritized correction plan, deciding whether code is overbuilt for a $149 starter, generating implementation prompts for an agent, or running repeated buyer-fit and sellability improvement loops.
---

# SaaS Starter Iteration Loop

Use this skill to keep a SaaS starter aligned with a buyer who wants to ship quickly, understand the code quickly, and customize the starter without learning a mini-framework first.

This skill is not for enterprise architecture review. Optimize for:

- time to understand
- time to modify
- visible value
- low cognitive overhead
- sellability at the target price point

## Core operating model

Work in this sequence:

1. classify the user input
2. evaluate buyer fit and sellability
3. separate signal from noise
4. prioritize the smallest high-ROI changes
5. return a ready-to-use implementation prompt when fixes are requested
6. preserve loop continuity by updating or referencing the persistent repo docs when present

## Input types

Handle these input types:

### 1. audit response from a coding agent

The user pastes an audit or review of the codebase.

Your job:

- validate whether the audit is accurate
- detect exaggerations, weak claims, or missed issues
- re-rank the findings by buyer impact
- convert the audit into an execution plan

### 2. code or architecture proposal

The user asks whether a pattern, abstraction, or feature direction is right for the starter.

Your job:

- judge whether it fits the buyer
- identify whether the idea is acceptable, slightly sophisticated, borderline, or too much for this audience
- recommend the smallest better version

### 3. post-fix re-audit

The user returns after changes were applied and wants the next loop.

Your job:

- compare the new state against prior problems if available
- identify what improved
- identify what still blocks sellability
- define the next highest-ROI fixes

## Verdict scale

Use these labels consistently:

- acceptable
- acceptable but slightly sophisticated
- borderline for this audience
- too much for this audience

## What to penalize

Penalize these heavily when they appear in ordinary feature work:

- framework-within-a-framework drift
- wrappers that hide obvious flow
- repositories by default
- use-cases or handlers for simple CRUD
- dependency injection without clear buyer payoff
- too many files for simple operations
- feature implementations that require documentation before a buyer can edit them
- pricing or gating systems that are powerful but hard to extend
- dashboards that look generic rather than product-ready

## What to reward

Reward these strongly:

- thin and obvious request boundaries
- business logic that is easy to locate
- feature-owned logic with predictable conventions
- pricing and gating systems that are extensible without ceremony
- UI and dashboard areas that increase immediate buyer confidence
- docs that help a buyer modify the product quickly
- simple but credible implementations over ambitious invisible architecture

## Default analysis checklist

Evaluate against these dimensions when relevant:

- buyer fit
- time to understand
- time to modify
- cognitive simplicity
- feature credibility
- perceived value at the stated price
- differentiation
- launch readiness
- docs readiness

## Decision rules

### abstraction rule

If an abstraction needs explanation before it saves time, treat it with suspicion.

### buyer visibility rule

If the buyer will not notice the payoff quickly, do not overvalue the pattern.

### complexity rule

Only allow higher structure where complexity is genuinely earned, such as:

- billing
- auth
- teams and permissions
- webhooks
- external sync
- audit-sensitive flows

### smallest-fix rule

Prefer:

- dropping a layer
- inlining a mapper
- moving logic closer to the feature
- simplifying naming
- reducing support-file count

Over broad rewrites should be rare unless the current shape blocks normal modification.

## Output modes

Choose the narrowest output that matches the user's need.

### mode A: audit critique

Use when the user pastes an external audit.

Return:

1. verdict on the audit quality
2. what is correct
3. what is overstated or weak
4. what is missing
5. reprioritized top fixes
6. implementation prompt for the coding agent

### mode B: direct architecture judgment

Use when the user asks about a specific decision.

Return:

1. verdict
2. why it fits or misses the buyer
3. what to keep
4. what to simplify
5. the smallest better version

### mode C: iteration checkpoint

Use when the user returns after changes.

Return:

1. what improved
2. remaining blockers
3. next 3 to 5 highest-ROI fixes
4. updated implementation prompt
5. recommendation on whether to keep iterating architecture, features, docs, or polish

## Prompt generation rules

When generating a prompt for a coding agent:

- make the target outcome explicit
- define what to change and what to preserve
- forbid over-engineering
- require direct, minimal changes
- ask for concrete file-level implementation, not abstract advice
- ask for a concise implementation summary after the patch

## Persistent memory docs

If the repo docs exist, align recommendations with them. The expected files are:

- repo-docs/docs/starter-audit-loop.md
- repo-docs/docs/buyer-persona.md
- repo-docs/docs/design-principles.md
- repo-docs/docs/sellability-checklist.md
- repo-docs/docs/master-audit-prompt.md

If the user shares contents from those docs, treat them as the source of truth for:

- target buyer
- evaluation principles
- current iteration state
- audit format
- sellability criteria

## Response style

Lead with the verdict.
Be commercially grounded.
Call out when something is structurally valid but commercially overbuilt.
Prefer the smallest useful simplification.
Do not praise architecture that slows down modification for this buyer.
