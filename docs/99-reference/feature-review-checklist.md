# Feature Review Checklist

## Purpose

This checklist is used to review whether a feature is a good fit for the starter before it increases product complexity, documentation burden, or buyer friction.

It is not only a code review checklist.  
It is a buyer-fit, product-fit, and sellability checklist.

Use it when reviewing:

- new features
- refactors
- architecture changes
- reusable abstractions
- product additions before launch
- changes that affect customization paths

This file is intentionally short and operational.

---

## Core Rule

If a new feature makes common buyer changes harder to understand, harder to locate, harder to document, or harder to modify, it should be questioned before it is added.

This starter is not supposed to become a framework-within-a-framework.  
It should remain:

- easy to understand
- easy to customize
- fast to launch from
- predictable to work in
- commercially attractive to the target buyer

---

# 1. Buyer Fit Check

## Who benefits from this feature?

Mark the best answer:

- [ ] Almost every buyer
- [ ] Many buyers in the core target audience
- [ ] A narrower but still valuable buyer segment
- [ ] Mostly edge cases
- [ ] Mostly the builder, not the buyer

### Review rule

If the feature mainly benefits the builder’s architectural preferences rather than the buyer’s speed, clarity, or launch readiness, it is suspicious.

---

# 2. Product Value Check

## What buyer-facing value does this feature create?

Mark all that apply:

- [ ] Faster launch
- [ ] Easier customization
- [ ] More visible product quality
- [ ] Better monetization readiness
- [ ] Better auth/account/team flow
- [ ] Better billing flow
- [ ] Better docs or onboarding experience
- [ ] Better launch assets or public presentation
- [ ] Mostly invisible internal sophistication

### Review rule

If the value is mostly invisible and does not clearly reduce buyer friction, the feature may not deserve its complexity cost.

---

# 3. Common Customization Impact Check

## Does this feature make common buyer tasks easier or harder?

Review these high-value tasks:

- [ ] Add or remove auth providers
- [ ] Protect a route
- [ ] Add a dashboard page
- [ ] Duplicate a feature
- [ ] Customize profile settings
- [ ] Rename team to workspace
- [ ] Change Stripe pricing
- [ ] Rebrand the UI
- [ ] Edit landing and public pages

### Mark one:

- [ ] Makes several of these easier
- [ ] Neutral
- [ ] Makes one or more of these harder

### Review rule

If a feature makes common buyer changes harder, it needs very strong justification.

---

# 4. Complexity Class Check

## What kind of complexity is this?

Mark one:

- [ ] Simple product feature
- [ ] Moderate workflow
- [ ] Naturally complex infrastructure
- [ ] Architecture-heavy pattern
- [ ] Unclear

### Review rule

Simple product features should not introduce architecture-heavy patterns.  
More structure is acceptable in naturally complex areas such as:

- billing
- permissions
- auth edge cases
- webhooks
- external sync
- audit-sensitive flows

---

# 5. Structural Simplicity Check

## Does the feature stay aligned with the starter structure?

Check all that apply:

- [ ] Business logic stays near the feature
- [ ] Shared code is only shared when truly reusable
- [ ] App routes remain thin
- [ ] Server logic remains easy to test
- [ ] No unnecessary global abstractions were added
- [ ] No enterprise layers were introduced by default

### Warning signs

- [ ] Added repositories by default
- [ ] Added use-cases for ordinary product work
- [ ] Added service layers without strong buyer value
- [ ] Added registries, wrappers, or adapters for simple flows
- [ ] Added internal conventions buyers must learn first

### Review rule

Good boundaries are valuable.  
Extra ceremony is not.

---

# 6. Locality Check

## Does the feature stay local enough?

Mark one:

- [ ] Mostly local to one feature
- [ ] Local with a small shared touchpoint
- [ ] Spread across several areas
- [ ] Requires multiple unrelated layers

### Review rule

The more common the feature customization will be, the more local it should remain.

---

# 7. Naming and Discoverability Check

## Will a buyer understand where this feature lives?

Check all that apply:

- [ ] File and folder names are obvious
- [ ] The main edit path is easy to find
- [ ] The feature matches existing naming conventions
- [ ] The feature can be understood without reading architecture docs first

### Warning signs

- [ ] The main logic is hidden behind generic names
- [ ] The buyer must trace multiple indirections
- [ ] The feature introduces new naming patterns
- [ ] The edit path is not obvious

### Review rule

If a buyer cannot find the main edit points quickly, the feature is too opaque.

---

# 8. Documentation Burden Check

## How hard will this feature be to document?

Mark one:

- [ ] Easy to explain as a short recipe
- [ ] Reasonable to explain
- [ ] Hard to explain cleanly
- [ ] Needs a mini architecture tutorial first

### Review rule

If a common buyer-facing feature is hard to document, that is a strong sign the implementation may be too indirect.

### Additional check

- [ ] This feature will require one new guide
- [ ] This feature will require several small guides
- [ ] This feature will require a large theory section
- [ ] This feature will increase support burden noticeably

---

# 9. Reuse vs Over-Engineering Check

## Is the abstraction level justified?

Mark one:

- [ ] Direct and obvious
- [ ] Structured but still pragmatic
- [ ] Slightly sophisticated
- [ ] Borderline ceremony
- [ ] Too much for this audience

### Review rule

Prefer:

- thin actions
- feature-owned server logic
- local helpers
- obvious patterns

Be skeptical of:

- dependency injection by default
- typed dependency containers
- repositories everywhere
- command handlers for normal feature work
- abstractions that save little buyer time

---

# 10. Removal Test

## Could a buyer remove this feature cleanly if they do not need it?

Mark one:

- [ ] Easy to remove
- [ ] Reasonably easy to remove
- [ ] Hard to remove
- [ ] Deeply entangled

### Review rule

Starter features should be removable when they are optional.  
A good starter is not just easy to extend. It is also easy to simplify.

---

# 11. Duplication Test

## Could a buyer use this feature as a template for another feature?

Mark one:

- [ ] Yes, very easily
- [ ] Yes, with small adaptation
- [ ] Maybe, but not ideal
- [ ] No, too specialized or too abstract

### Review rule

Features that can teach buyers how to build the next feature are especially valuable in a starter product.

---

# 12. Launch Readiness Check

## Does this feature improve launch readiness?

Check all that apply:

- [ ] Helps the buyer ship faster
- [ ] Helps the buyer monetize faster
- [ ] Helps the buyer present the product better
- [ ] Helps the buyer customize important product flows
- [ ] Mostly increases internal sophistication

### Review rule

Features that improve launch readiness are usually more valuable than features that only improve architectural elegance.

---

# 13. Support Cost Check

## Will this feature reduce or increase support load?

Mark one:

- [ ] Likely reduces support
- [ ] Neutral
- [ ] Slightly increases support
- [ ] Will likely create repeated support questions

### Review rule

A feature that increases support burden should only ship if its buyer value is clearly worth it.

---

# 14. Red Flags

If any of these are true, slow down:

- [ ] The feature mainly adds invisible sophistication
- [ ] The feature makes common buyer tasks harder
- [ ] The feature is hard to explain clearly
- [ ] The feature introduces new conventions buyers must learn
- [ ] The feature requires too many files for common edits
- [ ] The feature is difficult to remove
- [ ] The feature duplicates enterprise architecture patterns without buyer payoff
- [ ] The feature feels impressive technically but weak commercially

### Decision trigger

If **2 or more red flags** are checked, the feature should be reviewed again before shipping.

---

# 15. Green Flags

These are strong positive signals:

- [ ] The feature is easy to understand quickly
- [ ] The feature is easy to customize
- [ ] The feature improves visible value
- [ ] The feature is mostly local
- [ ] The feature fits the existing structure cleanly
- [ ] The feature can be duplicated as a pattern
- [ ] The feature helps launch readiness
- [ ] The feature is easy to document
- [ ] The feature is easy to remove if optional

---

# 16. Scorecard

Score each section from 1 to 5.

## A. Buyer value

- 1 = weak
- 2 = limited
- 3 = acceptable
- 4 = strong
- 5 = very strong

Score: \_\_\_

## B. Effect on common customization

- 1 = makes things harder
- 2 = slightly worse
- 3 = neutral
- 4 = slightly better
- 5 = clearly better

Score: \_\_\_

## C. Structural simplicity

- 1 = overbuilt
- 2 = too layered
- 3 = acceptable
- 4 = pragmatic
- 5 = very clean and obvious

Score: \_\_\_

## D. Documentation burden

- 1 = very hard to explain
- 2 = harder than it should be
- 3 = acceptable
- 4 = easy to explain
- 5 = trivial to explain

Score: \_\_\_

## E. Launch usefulness

- 1 = weak
- 2 = marginal
- 3 = acceptable
- 4 = useful
- 5 = highly useful

Score: \_\_\_

## Total

Total score: \_\_\_ / 25

### Interpretation

- 22 to 25 = excellent fit
- 18 to 21 = good fit
- 14 to 17 = borderline
- below 14 = likely too costly or too complex for this starter

---

# 17. Final Decision

Choose one:

- [ ] Ship as planned
- [ ] Ship after small cleanup
- [ ] Ship after simplification
- [ ] Delay until the product value is clearer
- [ ] Reject because it is too complex or too low-value

---

# 18. Final Reminder

For this starter, a feature is not good just because it is technically clean.

A feature is good when it is:

- buyer-relevant
- easy to understand
- easy to document
- easy to customize
- easy to remove when optional
- helpful for launch speed and product clarity

If it weakens those qualities, it should be simplified or rejected.
