# Documentation Review Checklist

## Purpose

This checklist is a fast review tool for judging whether a documentation guide is:

- clear enough
- short enough
- local enough
- buyer-friendly enough
- or a warning sign that the implementation may be too complex

Use it when reviewing:

- new customization guides
- setup docs
- architecture docs
- feature docs
- launch-readiness docs

This file is intentionally short.  
It is the operational version of `doc-complexity-rules.md`.

---

## Quick Decision Rule

If a guide for a common buyer task feels like a mini architecture lesson instead of a practical recipe, stop and question the implementation.

Documentation should reduce friction.  
It should not explain away unnecessary complexity.

---

# 1. Scope Check

## What kind of task is this?

Mark one:

- [ ] Common buyer task
- [ ] Moderate product task
- [ ] Naturally complex system task

### Common buyer task examples

- add an auth provider
- remove an auth provider
- protect a route
- add a dashboard page
- rename team to workspace
- change profile fields
- edit pricing
- change branding
- duplicate a feature

### Naturally complex task examples

- Stripe webhooks
- subscription lifecycle handling
- advanced role rules
- provider-specific auth edge cases
- deployment edge cases

### Review rule

If this is a **common buyer task**, the simplicity bar must be much stricter.

---

# 2. Recipe Check

Can this guide be written as a simple recipe?

- [ ] Purpose
- [ ] When to use it
- [ ] Files to edit
- [ ] Steps
- [ ] Example
- [ ] Common mistakes
- [ ] Related docs

### Review rule

If the guide cannot fit this structure cleanly, the implementation may be too indirect or too fragmented.

---

# 3. Length Check

## Is the guide short enough for the type of task?

For a common buyer task:

- [ ] Usually 5 to 8 steps or fewer
- [ ] Short explanation before action starts
- [ ] Limited caveats
- [ ] No long theory section

### Warning signs

- [ ] More than 8 steps for a simple task
- [ ] Too many exceptions
- [ ] Too much explanation before the first real action
- [ ] Repeated “also update this” notes

### Review rule

If a simple guide is long, question the code before expanding the doc.

---

# 4. File Count Check

## How many files does the buyer need to touch?

Mark one:

- [ ] 1 to 2 files
- [ ] 2 to 4 files
- [ ] More than 4 files

### Review rule

For a common task:

- 1 to 2 files = excellent
- 2 to 4 files = usually acceptable
- more than 4 files = warning sign unless the domain is naturally complex

### Warning signs

- [ ] Requires config + registry + wrapper + shared types + feature files
- [ ] Requires touching unrelated folders
- [ ] Requires hidden support files for a simple change

---

# 5. Locality Check

## Does the change stay near the feature?

- [ ] Mostly local to the feature
- [ ] Mostly local with a small shared touchpoint
- [ ] Spread across many unrelated areas

### Review rule

Common edits should stay close to the feature.

### Warning signs

- [ ] Must edit route layer, global lib, registry, adapter, and feature code
- [ ] Logic is split across too many unrelated directories
- [ ] The doc reads like a repo tour

---

# 6. Architecture Explanation Check

## How much architecture must be explained before the buyer can act?

Mark one:

- [ ] Almost none
- [ ] A little
- [ ] Too much

### Good sign

The guide quickly says:

- open this file
- change this value
- add this route
- duplicate this module
- run this command

### Warning signs

The guide must explain:

- [ ] internal registries
- [ ] orchestration layers
- [ ] mapper chains
- [ ] wrappers around wrappers
- [ ] custom starter-specific abstractions
- [ ] architectural concepts before the first step

### Review rule

If action starts late because architecture explanation comes first, complexity may be too high.

---

# 7. Buyer Confidence Check

After reading the guide, will the buyer likely feel:

- [ ] I know where to go
- [ ] I can try this safely
- [ ] I understand the change path
- [ ] I do not need support yet

Or instead:

- [ ] I am still hesitant
- [ ] I am afraid to break things
- [ ] I need more context before I can act
- [ ] I still do not know where the real logic lives

### Review rule

The guide should increase buyer confidence, not expose hidden complexity.

---

# 8. Natural vs Self-Inflicted Complexity Check

## Why is this guide long or hard?

Choose the dominant reason:

- [ ] The domain is naturally complex
- [ ] The implementation adds unnecessary indirection
- [ ] Naming is confusing
- [ ] Logic is not local enough
- [ ] Too many abstractions are involved
- [ ] The starter has drifted toward framework-within-a-framework behavior

### Review rule

Do not assume complexity is justified just because the guide is hard to write.

---

# 9. Red Flags

If any of these are true, slow down and review the implementation:

- [ ] A common task needs more than 8 steps
- [ ] A common task touches more than 4 files
- [ ] The guide needs a theory section before action begins
- [ ] The buyer must understand starter-specific architecture first
- [ ] The same change must be registered in multiple places
- [ ] A small local change requires edits in shared/global infrastructure
- [ ] The guide includes many caveats, warnings, or hidden dependencies
- [ ] The guide feels hard because of internal abstraction, not domain complexity

### Decision trigger

If **2 or more red flags** are checked, the implementation should be reviewed before the doc is finalized.

---

# 10. Green Flags

These are strong positive signals:

- [ ] The guide is short and direct
- [ ] The edit path is obvious
- [ ] The change is mostly local
- [ ] Very little architecture explanation is needed
- [ ] The buyer can follow an existing feature pattern
- [ ] The guide makes the starter feel easy to modify
- [ ] The doc and the code tell the same story
- [ ] The product feels like a clean app, not a private platform

---

# 11. Scorecard

Score each category from 1 to 5.

## A. Time to find where to edit

- 1 = hard to locate
- 2 = slow to locate
- 3 = acceptable
- 4 = easy
- 5 = obvious immediately

Score: \_\_\_

## B. Number of files to modify

- 1 = far too many
- 2 = too many
- 3 = acceptable
- 4 = efficient
- 5 = minimal

Score: \_\_\_

## C. Architecture explanation required

- 1 = too much
- 2 = more than ideal
- 3 = acceptable
- 4 = light
- 5 = almost none

Score: \_\_\_

## D. Locality of change

- 1 = highly scattered
- 2 = too spread out
- 3 = acceptable
- 4 = mostly local
- 5 = clearly local

Score: \_\_\_

## E. Buyer confidence after reading

- 1 = still hesitant
- 2 = low confidence
- 3 = could attempt
- 4 = confident
- 5 = very confident

Score: \_\_\_

## Total

Total score: \_\_\_ / 25

### Interpretation

- 22 to 25 = excellent
- 18 to 21 = good
- 14 to 17 = borderline
- below 14 = simplify the implementation or reduce abstraction before shipping the doc

---

# 12. Review Decision

Choose one:

- [ ] Ship the guide as is
- [ ] Ship after small wording cleanup
- [ ] Ship after minor implementation cleanup
- [ ] Pause and simplify the implementation first
- [ ] Escalate because this task may be overbuilt for the buyer

---

# 13. Final Reminder

For this starter, documentation is not supposed to rescue avoidable complexity.

If a common buyer guide becomes hard to write cleanly, the safest assumption is:

**the implementation needs simplification before the documentation expands further.**
