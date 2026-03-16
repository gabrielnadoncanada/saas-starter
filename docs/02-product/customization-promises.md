# Customization Promises

## Purpose

This document defines the customization promises the starter makes to a paying buyer.

These are not vague marketing claims.  
They are practical promises about what should be easy to find, easy to change, and easy to extend.

This file should be used as a filter for:

- product scope decisions
- documentation priorities
- architecture decisions
- marketing claims
- feature review
- launch readiness

If the starter claims something is easy, the codebase and documentation should support that claim clearly.

---

## Core Promise

This starter is designed so that common high-value customization jobs feel obvious.

The buyer should be able to:

- understand the codebase quickly
- change important product behavior quickly
- remove unused starter parts cleanly
- extend the product without fighting internal architecture
- launch faster from a modern foundation

The goal is not to hide the code.  
The goal is to make the code easy to understand and easy to modify.

---

## Buyer Standard

The buyer is paying for:

- speed
- clarity
- confidence
- visible quality
- fast customization
- lower setup cost
- fewer architecture decisions to make from scratch

The buyer is not paying to learn a framework-within-a-framework.

So every customization promise must stay aligned with this standard:

- obvious
- local
- pragmatic
- documented
- fast to modify

---

# 1. Authentication Customization Promises

## Promise 1

**Add or remove auth providers from one obvious auth entry point.**

What this means:

- provider configuration should not be scattered across unrelated files
- the buyer should not need to refactor the auth system to remove one provider
- docs should explain the common provider changes clearly

## Promise 2

**Customize sign-in behavior without touching unrelated business features.**

What this means:

- sign-in page behavior should be easy to locate
- redirect logic should be easy to understand
- auth callbacks and auth events should be easy to find

## Promise 3

**Protect or unprotect routes quickly.**

What this means:

- route protection should have a clear boundary
- adding a new private app route should not require learning hidden rules
- public/private access should be predictable

## Promise 4

**Adjust auth flow without learning internal architecture first.**

What this means:

- the buyer should quickly understand where auth starts
- the buyer should not need to trace multiple abstraction layers
- common auth edits should feel direct

---

# 2. Dashboard and App Shell Customization Promises

## Promise 5

**Add or remove dashboard pages without restructuring the whole app.**

What this means:

- dashboard modules should be composable
- page-level customization should stay local
- deleting a starter page should not break the app shell

## Promise 6

**Rename navigation, labels, and dashboard copy quickly.**

What this means:

- common text should be easy to locate
- navigation structure should be obvious
- the buyer should be able to adapt the starter to a new product vocabulary quickly

## Promise 7

**Customize the app shell without breaking business modules.**

What this means:

- shell layout concerns should stay separate from feature logic
- branding changes should not force business logic edits
- visual structure should be adaptable

---

# 3. Feature Module Customization Promises

## Promise 8

**Use existing features as patterns for new features.**

What this means:

- a buyer should be able to copy an existing feature flow and adapt it
- simple domain modules should not require new architecture work
- starter features should teach the product structure through example

## Promise 9

**Keep feature logic local and predictable.**

What this means:

- components, server logic, schemas, and types should live in expected places
- the buyer should not need to jump across the entire repo to edit one feature
- feature ownership should stay obvious

## Promise 10

**Make simple changes stay simple.**

What this means:

- common CRUD-level customization should not require enterprise ceremony
- small edits should not require opening many support files
- the code should preserve buyer confidence during early changes

---

# 4. Account and Profile Customization Promises

## Promise 11

**Customize profile and account settings from obvious files.**

What this means:

- adding a field should not require hunting through unrelated layers
- validation and persistence should be easy to trace
- buyer-facing account flows should be easy to modify

## Promise 12

**Add or remove account fields without destabilizing the starter.**

What this means:

- the account area should be built for extension
- common product-specific profile data should be easy to add
- removing unused settings should be straightforward

## Promise 13

**Extend account settings later without rewriting the whole section.**

What this means:

- account structure should support growth
- the buyer should be able to add preferences, profile metadata, or identity controls progressively

---

# 5. Team and Workspace Customization Promises

## Promise 14

**Rename team concepts to fit the buyer's business model quickly.**

What this means:

- team, workspace, organization, company, or project space should be adaptable
- starter vocabulary should not trap the buyer into your terminology

## Promise 15

**Keep or remove the team/workspace layer without deep rewrites.**

What this means:

- the buyer should be able to simplify the app if they do not need multi-team behavior
- the team concept should be additive, not invasive

## Promise 16

**Extend team behavior from a clear base.**

What this means:

- adding invites, roles, or scoped data access should feel like extending a known structure
- role-based conditions should have a clear home
- the team model should feel practical, not theoretical

---

# 6. Billing and Stripe Customization Promises

## Promise 17

**Plug in Stripe and adapt pricing logic quickly.**

What this means:

- Stripe setup should be clearly documented
- products, prices, and plan behavior should be easy to find
- the buyer should not fear touching billing config

## Promise 18

**Keep billing complexity structured and contained.**

What this means:

- checkout, portal, webhook, and subscription logic should not leak into unrelated app areas
- billing should be complex only where billing is naturally complex
- the buyer should be able to follow the flow without reverse-engineering the product

## Promise 19

**Change plan structure without rewriting the starter.**

What this means:

- free, monthly, yearly, or custom plan logic should be adaptable
- pricing labels and gating rules should be easy to edit
- billing should support product iteration

## Promise 20

**Document billing edits clearly because billing is high-risk.**

What this means:

- this area needs stronger docs than ordinary UI edits
- common customization jobs should be explained explicitly
- the buyer should know where to change pricing, webhooks, and redirects

---

# 7. Database and Data Model Customization Promises

## Promise 21

**Start local development with a predictable database workflow.**

What this means:

- setup, migrate, seed, reset, and inspect workflows should feel safe and documented
- the buyer should be able to get to working data quickly

## Promise 22

**Add business entities without rewriting the foundation.**

What this means:

- extending the schema should feel normal
- starter data foundations should help, not constrain
- the buyer should be able to model their domain on top of the starter

## Promise 23

**Keep data access understandable from UI to server logic.**

What this means:

- the buyer should be able to trace how data moves
- schema, validation, server logic, and page rendering should connect predictably
- data access should not disappear behind unnecessary layers

---

# 8. UI and Branding Customization Promises

## Promise 24

**Make the product look like the buyer's brand quickly.**

What this means:

- logo, colors, name, typography, and visual accents should be easy to update
- the starter should not resist rebranding

## Promise 25

**Customize shared UI without breaking feature logic.**

What this means:

- shared design elements should be reusable and replaceable
- visual changes should stay decoupled from business logic
- polishing the UI should not become a structural refactor

## Promise 26

**Keep the design foundation premium but editable.**

What this means:

- the starter should look credible out of the box
- the buyer should still be able to shift the product toward a different visual style quickly

---

# 9. Landing, Pricing, and Marketing Customization Promises

## Promise 27

**Edit the landing page without touching app internals.**

What this means:

- hero, features, testimonials, FAQ, and CTA content should be easy to customize
- marketing pages should not feel harder to edit than product pages

## Promise 28

**Change public pricing and offer messaging quickly.**

What this means:

- plan names, plan prices, and feature comparison should be easy to update
- public pricing should align with the buyer's business model without deep code edits

## Promise 29

**Use the starter as both a product foundation and a launch foundation.**

What this means:

- the buyer should be able to customize public-facing launch assets quickly
- the starter should support faster market entry, not only faster backend setup

---

# 10. Documentation and Developer Experience Promises

## Promise 30

**Get the starter running fast with setup docs that respect the buyer's time.**

What this means:

- setup should be short, practical, and tested
- environment variables should be explained clearly
- the buyer should not need to infer missing steps

## Promise 31

**Document the most valuable customization jobs first.**

What this means:

- docs should prioritize:
  - auth provider changes
  - route protection
  - profile field edits
  - dashboard page creation
  - billing setup
  - branding changes
  - feature duplication patterns

## Promise 32

**Make the first two hours feel safe.**

What this means:

- the buyer should gain confidence fast
- docs and code structure should reduce hesitation
- the buyer should feel momentum immediately after purchase

---

# 11. "Easy to Customize" Proof Standard

The starter should be able to support claims like these honestly:

- Add or remove auth providers from one obvious place
- Protect new routes in minutes
- Duplicate an existing feature to create a new one
- Customize profile settings without touching unrelated code
- Rename or remove the team/workspace concept quickly
- Plug in your own Stripe products and pricing
- Rebrand the product fast
- Launch from a modern stack without starting from scratch

A claim should not be used in marketing unless:

- the codebase supports it clearly
- the edit path is reasonably direct
- the docs explain it
- the buyer can do it without learning internal architecture first

---

# 12. Promise Boundaries

These promises are intentionally practical.

This starter does **not** promise:

- enterprise architecture purity
- unlimited abstraction
- every possible feature already built
- zero coding required
- a framework that hides all product decisions

This starter **does** promise:

- a modern SaaS foundation
- pragmatic structure
- obvious customization paths
- real launch acceleration
- low cognitive overhead for common product changes

---

# 13. Review Questions

Use these questions when reviewing any feature or abstraction:

- Does this make a high-value buyer customization easier?
- Is the edit path obvious?
- Would a competent Next.js developer understand this in under a minute?
- Does this reduce friction or create new ceremony?
- Is this promise supported by the code and docs?
- Are we making the buyer faster, or just making ourselves feel architecturally clean?

If the answer is unclear, the promise may not be strong enough yet.

---

# 14. Recommended Marketing Translation

These promises can be translated into sales language such as:

- Built to customize fast
- Change common product flows without learning a custom framework
- Start from a modern stack and adapt it to your business quickly
- Pragmatic structure for real-world SaaS launches
- Production-minded foundations without unnecessary complexity

Marketing copy should stay aligned with the real customization experience.

---

# 15. Related Documents

This file should be used alongside:

- `docs/02-product/buyer-user-stories.md`
- `docs/03-architecture/technical-architecture.md`
- `docs/03-architecture/decisions-log.md`
- `docs/04-marketing-sales/easy-to-customize.md`

Together, these documents define:

- what the buyer wants to change
- what the product promises
- what the codebase must support
- what marketing is allowed to claim
