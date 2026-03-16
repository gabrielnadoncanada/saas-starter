# Documentation Complexity Rules

## Purpose

This document defines the rules used to judge whether a documentation guide is acceptably simple, borderline, or a signal that the underlying implementation is too complex for the buyer.

This is not only a documentation standard.  
It is also a product and architecture review tool.

For this starter, documentation is not supposed to compensate for unnecessary complexity.

If a common buyer task becomes hard to document clearly, that usually means one of two things:

- the task is naturally complex
- or the implementation has become too abstract, too fragmented, or too indirect

This document exists to tell the difference.

---

## Core Principle

If a guide for a common buyer customization job becomes long, fragile, difficult to explain, or dependent on too much architectural context, the default assumption should be:

**the implementation may be too complicated for this type of starter.**

The burden of proof is not on the documentation writer to explain complexity away.  
The burden of proof is on the implementation to justify why the complexity is necessary.

---

## Product Standard

This starter is designed for:

- solo founders
- indie builders
- freelancers and consultants
- small technical teams
- buyers who want to launch quickly
- buyers who want to understand and modify the code quickly

So the standard is:

- fast to understand
- fast to modify
- predictable to navigate
- low cognitive overhead
- pragmatic instead of ceremonial

This product is not optimized for maximum architecture purity.  
It is optimized for buyer momentum.

---

# 1. Master Rule

For every common buyer task, ask:

**Can a competent Next.js developer understand where to make the change in under one minute and complete the change with a small number of clear steps?**

If the answer is no, that is a signal that the implementation may need simplification.

This question should be asked before writing documentation and after writing documentation.

---

# 2. What Counts as a Common Buyer Task

These rules apply most strongly to tasks such as:

- adding an auth provider
- removing an auth provider
- changing sign-in behavior
- protecting a route
- adding a dashboard page
- removing a starter feature
- customizing profile settings
- renaming team to workspace
- changing billing plans or Stripe prices
- changing branding
- editing the landing page
- duplicating a feature as a base for a new one

These are high-frequency, high-value customization jobs.  
They should not feel architecturally expensive.

---

# 3. Documentation Complexity Tests

## Test 1 — Length Test

A guide for a common buyer task should usually stay within:

- 5 to 8 steps for a simple task
- 1 to 3 files for a simple change
- a short explanation of context
- a stable before/after example

### Healthy

- short guide
- direct edit path
- clear result
- few caveats

### Warning Sign

- too many steps
- many branches and exceptions
- large explanation section before action begins
- repeated "also update this other place" notes

### Interpretation

If a common task cannot be explained in a compact guide, the code may be too fragmented or too indirect.

---

## Test 2 — File Count Test

Count the number of files the buyer must realistically touch.

### Expected Range

- 1 to 2 files for simple UI or config changes
- 2 to 4 files for normal feature changes
- more tolerance for naturally complex domains like billing or auth internals

### Warning Sign

If a simple task touches:

- page
- config
- registry
- mapper
- constants
- wrapper
- hook
- service
- action
- validator
- adapter
- types
- shared helpers

the implementation may have too many layers for this audience.

### Interpretation

A common buyer change should not feel like a scavenger hunt.

---

## Test 3 — Locality Test

A healthy customization path keeps change close to the feature being edited.

### Healthy

A profile change mainly touches:

- account feature files
- related schema
- related server logic
- related UI

### Warning Sign

A profile change requires touching:

- route layer
- shared lib
- adapter layer
- use-case layer
- config registry
- global types
- feature metadata files
- multiple unrelated folders

### Interpretation

When a change is not local, documentation gets longer and buyer confidence drops.

---

## Test 4 — Architecture Explanation Test

Read the draft guide and ask:

**How much architecture must be explained before the buyer can act?**

### Healthy

The guide says:

- open this file
- change this value
- add this provider
- duplicate this module
- update this route
- run this command

### Warning Sign

The guide must first explain:

- the orchestration layer
- the registry system
- the mapper hierarchy
- the action wrapper abstraction
- typed contracts between internal layers
- framework-specific indirection unique to this starter

### Interpretation

If a guide needs a tutorial on internal architecture before action starts, the starter is drifting toward framework-within-a-framework behavior.

---

## Test 5 — Recipe Test

A good guide should be writable as a stable recipe.

It should normally fit this structure:

- Purpose
- When to use it
- Files to edit
- Steps
- Example
- Common mistakes
- Related docs

### Warning Sign

If the writer cannot produce a stable recipe because:

- the edit path changes too much
- the logic is too distributed
- there are too many hidden conditions
- the abstraction chain is too deep

then the implementation may be too sophisticated for the product.

---

## Test 6 — Buyer Value Test

Ask:

**Is this complexity visible and useful to the buyer?**

### Complexity That May Be Justified

- billing
- auth edge cases
- permissions
- team membership rules
- webhooks
- external sync
- audit-sensitive flows

### Complexity That Is Suspicious

- changing a button label
- adding a page
- removing a provider
- changing navigation
- editing profile fields
- renaming team to workspace
- adding a standard feature module

### Interpretation

If the complexity is not buyer-visible and does not clearly reduce time-to-modify, it is probably too expensive.

---

## Test 7 — Natural Complexity vs Self-Inflicted Complexity

When a guide is long, ask:

**Is the task long because the domain is naturally complex, or because our implementation added unnecessary cognitive cost?**

### Natural Complexity

- Stripe webhooks
- subscription state handling
- advanced role permissions
- auth edge cases
- external provider setup

### Self-Inflicted Complexity

- standard dashboard page creation
- settings field update
- route protection
- provider toggle
- marketing page edit
- feature duplication

### Interpretation

Long guides are not always bad.  
But long guides for common product changes are usually a warning sign.

---

# 4. Practical Rules

## Rule 1

**Common buyer tasks must have short guides.**

If a common task needs a long guide, simplify the implementation before expanding the documentation.

## Rule 2

**Do not use documentation to justify unnecessary abstraction.**

Documentation should explain the product, not excuse avoidable ceremony.

## Rule 3

**A common task should not require learning an internal framework first.**

If a buyer must understand custom architecture before making a simple change, the starter has likely become too complex.

## Rule 4

**Most common changes should stay local to the feature.**

If common changes cross too many layers, the structure should be questioned.

## Rule 5

**The more frequent the buyer task, the stricter the simplicity bar.**

The highest standards apply to:

- auth provider changes
- route protection
- dashboard pages
- settings fields
- Stripe pricing edits
- branding changes
- team/workspace renaming

## Rule 6

**The documentation writer is allowed to challenge the implementation.**

If a guide feels too difficult to write cleanly, that feedback is valid architecture feedback.

## Rule 7

**Do not let support-heavy complexity hide behind “advanced flexibility.”**

If flexibility makes common buyer edits slower or more fragile, it may not be worth it.

---

# 5. Scoring System

Use this scorecard for any customization guide.

## A. Time to Find Where to Edit

- 1 = hard to locate
- 2 = requires investigation
- 3 = acceptable
- 4 = easy to locate
- 5 = immediately obvious

## B. Number of Files to Modify

- 1 = far too many
- 2 = too many
- 3 = acceptable
- 4 = efficient
- 5 = minimal

## C. Architecture Explanation Required

- 1 = too much explanation needed
- 2 = more than ideal
- 3 = acceptable
- 4 = light explanation
- 5 = nearly none

## D. Locality of Change

- 1 = scattered everywhere
- 2 = too spread out
- 3 = acceptable
- 4 = mostly local
- 5 = clearly local

## E. Buyer Confidence After Reading

- 1 = still hesitant
- 2 = low confidence
- 3 = could try
- 4 = feels in control
- 5 = very confident

### Total Score Interpretation

- 22 to 25 = excellent
- 18 to 21 = good
- 14 to 17 = borderline
- below 14 = strong signal that simplification is needed

---

# 6. Red Flags

Treat these as strong warning signs.

- A simple customization guide needs more than 8 steps
- A simple customization guide touches more than 4 files
- The guide needs a long theory section before action begins
- The guide depends on too many starter-specific concepts
- The same change must be declared in multiple registries or metadata layers
- The buyer must edit multiple unrelated folders for a local feature change
- The guide includes many caveats, exceptions, or hidden dependencies
- The only reason the guide is long is the internal architecture

If two or more red flags are present, pause documentation and review the implementation.

---

# 7. Green Flags

These are signals that the implementation is in a good place.

- The guide can be explained as a compact recipe
- The buyer edits files that are close to the feature
- The guide needs little architecture explanation
- Naming makes the edit path obvious
- The buyer can reuse an existing feature pattern
- The guide creates confidence, not hesitation
- The docs and code tell the same story
- The implementation feels like a clean app, not a private platform

---

# 8. Review Workflow

Use this process whenever creating or reviewing a guide.

## Step 1

Identify the buyer task.

Ask:

- what is the buyer trying to change?
- how often will this happen?
- is this a first-two-hours customization task?

## Step 2

Draft the guide in recipe format.

Use:

- Purpose
- When to use it
- Files to edit
- Steps
- Example
- Common mistakes
- Related docs

## Step 3

Score the guide.

Use the 5-part scorecard in this document.

## Step 4

Identify whether complexity is natural or self-inflicted.

Do not assume complexity is justified.

## Step 5

Decide what to do.

Possible outcomes:

- keep the implementation as is
- simplify naming
- reduce file count
- localize the logic more clearly
- remove a wrapper or abstraction
- keep the complexity because the domain genuinely requires it

---

# 9. Examples

## Example A — Healthy Guide

### Task

Add an auth provider

### Healthy Guide Shape

- 5 steps
- 3 files
- one auth config entry point
- one env update
- one test step

### Verdict

Healthy. This is the kind of guide a paid starter should support.

---

## Example B — Too Complex

### Task

Add an auth provider

### Problematic Guide Shape

- 11 steps
- 8 files
- provider registry
- provider mapper
- UI adapter
- callback wrapper
- env parser
- strategy abstraction
- multiple starter-specific concepts

### Verdict

Too complex for this audience unless there is an unusually strong justification.

---

## Example C — Healthy Guide

### Task

Add a dashboard page

### Healthy Guide Shape

- add the page
- add or reuse a feature module
- update navigation
- optionally add a server function

### Verdict

Healthy. Simple product work stays simple.

---

## Example D — Too Complex

### Task

Add a dashboard page

### Problematic Guide Shape

- create page
- register metadata
- update route manifest
- declare permissions map
- create DTO
- create mapper
- create service
- create use-case
- connect adapter
- update registry

### Verdict

Structurally possible, but commercially overbuilt for this starter.

---

# 10. Final Decision Rule

Use this as the final filter:

**If a guide for a common buyer task reads like a mini architecture tutorial, the problem is probably in the implementation, not in the documentation.**

Documentation should help the buyer move faster.  
It should not teach them why the starter became harder to use.

---

# 11. How This Should Influence Product Decisions

This document should influence:

- feature reviews
- architecture reviews
- refactor decisions
- launch readiness checks
- support planning
- pricing confidence

A starter becomes easier to sell when:

- the code is easier to explain
- the docs are easier to write
- the buyer can act quickly
- common changes do not feel risky

If documentation repeatedly becomes hard to write cleanly, simplify the product.

---

# 12. Related Documents

This document should be used with:

- `docs/02-product/buyer-user-stories.md`
- `docs/02-product/customization-promises.md`
- `docs/04-marketing-sales/easy-to-customize.md`

Together, these documents define:

- what buyers want to change
- what the starter promises
- how those promises are marketed
- how to detect when the implementation is becoming too complex
