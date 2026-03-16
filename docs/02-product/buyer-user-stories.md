# Buyer User Stories

## Purpose

This document lists the user stories a paying buyer expects to accomplish quickly with the starter.

It is not a list of internal engineering tasks.  
It is a list of high-value customization jobs the buyer wants to do without fighting the codebase.

The core standard is simple:

- common changes should feel obvious
- high-value flows should be easy to locate
- the buyer should not need to learn a private framework first
- the starter should optimize for time to understand, time to modify, and time to ship

---

## Buyer Profile

This starter is designed for:

- solo founders
- indie hackers
- freelancers and consultants
- small technical teams
- developers launching client-facing SaaS quickly

The buyer is not primarily purchasing architecture purity.  
The buyer is purchasing speed, confidence, and a codebase that is easy to customize.

---

## Core Buyer Expectation

A buyer should be able to open the codebase and quickly understand:

- where authentication is configured
- where protected routes are enforced
- where billing logic lives
- where account and team settings live
- where dashboard modules are added or removed
- where feature-specific server logic lives
- where database setup, migrations, and seed workflows are run
- where landing, pricing, and marketing content can be customized

---

# 1. Authentication User Stories

## Providers

- As a buyer, I want to add a new auth provider without refactoring the full auth system.
- As a buyer, I want to remove an auth provider I do not need.
- As a buyer, I want to reorder auth providers on the sign-in screen.
- As a buyer, I want to rename provider labels and button text.
- As a buyer, I want to keep only email/password, only OAuth, or a mixed strategy.

## Auth Flow

- As a buyer, I want to customize sign-in and sign-out behavior from a clear entry point.
- As a buyer, I want to change the sign-in page path if my app uses different branding.
- As a buyer, I want to customize redirect behavior after login.
- As a buyer, I want to customize redirect behavior after logout.
- As a buyer, I want to disable sign-up if my product is invite-only.
- As a buyer, I want to add onboarding conditions after first login.

## Session and Access

- As a buyer, I want to change session behavior without rewriting unrelated auth code.
- As a buyer, I want to protect new private routes in minutes.
- As a buyer, I want to make a route public without digging through multiple layers.
- As a buyer, I want to restrict some screens based on user state, team role, or subscription state.

## Callbacks and Events

- As a buyer, I want to customize auth callbacks from one obvious place.
- As a buyer, I want to customize auth events without touching unrelated features.
- As a buyer, I want to attach my own business logic to sign-in, sign-up, and account-linking events.

---

# 2. Dashboard and App Shell User Stories

## Navigation

- As a buyer, I want to rename sidebar items quickly.
- As a buyer, I want to add a new dashboard route without restructuring the whole app.
- As a buyer, I want to remove unused dashboard items cleanly.
- As a buyer, I want to hide some routes until a feature is ready.
- As a buyer, I want to control which dashboard sections are visible to which users.

## Page Content

- As a buyer, I want to change page titles, descriptions, and actions quickly.
- As a buyer, I want to swap demo content for my own product language.
- As a buyer, I want to customize dashboard widgets, cards, tables, and dialogs without touching framework code.
- As a buyer, I want to connect pages to my own data model quickly.

## App Shell

- As a buyer, I want to customize the dashboard shell without breaking business features.
- As a buyer, I want to replace branding assets such as logo, title, and avatar behavior.
- As a buyer, I want to change the app layout while keeping the business features intact.

---

# 3. Feature Module User Stories

## Reuse and Extension

- As a buyer, I want to use an existing feature module as a pattern for my own feature.
- As a buyer, I want to duplicate a simple feature and adapt it into another domain.
- As a buyer, I want to add CRUD features without inventing a new architecture.
- As a buyer, I want to remove a demo feature if I do not need it.

## Predictable Feature Structure

- As a buyer, I want each feature to have a clear place for components, actions, server logic, schemas, and types.
- As a buyer, I want feature logic to stay local instead of leaking into global utility folders.
- As a buyer, I want feature-specific behavior to be understandable in under a minute.

## Safe Modification

- As a buyer, I want to change a feature without opening ten files first.
- As a buyer, I want simple changes to remain simple.
- As a buyer, I want business logic to live in predictable places so I can edit it confidently.

---

# 4. Account and Profile User Stories

## Profile Editing

- As a buyer, I want to customize the account profile form quickly.
- As a buyer, I want to add fields such as company name, role, phone, timezone, or avatar.
- As a buyer, I want to remove fields that do not fit my product.
- As a buyer, I want to change validation rules in an obvious place.

## Account Behavior

- As a buyer, I want to change the account settings page structure.
- As a buyer, I want to update profile persistence without touching unrelated features.
- As a buyer, I want to customize success and error handling for account updates.
- As a buyer, I want to add user preferences later without rewriting the whole account area.

## Security and Identity

- As a buyer, I want to support password changes if my auth flow requires it.
- As a buyer, I want to control account deletion or deactivation flows.
- As a buyer, I want to expose only the identity controls my product needs.

---

# 5. Team and Workspace User Stories

## Naming and Vocabulary

- As a buyer, I want to rename team to workspace, organization, company, or project space.
- As a buyer, I want to keep or remove the team concept depending on my product.
- As a buyer, I want the starter vocabulary to adapt to my business quickly.

## Team Management

- As a buyer, I want to create a new team or workspace.
- As a buyer, I want to rename a team.
- As a buyer, I want to invite members.
- As a buyer, I want to remove members.
- As a buyer, I want to update member roles.
- As a buyer, I want to switch the active team cleanly.

## Role and Access

- As a buyer, I want to restrict actions by team role.
- As a buyer, I want to show data scoped to the current team.
- As a buyer, I want to add role-based conditions without rewriting the app shell.
- As a buyer, I want the multi-team foundation to be easy to extend if my product grows.

---

# 6. Billing and Stripe User Stories

## Setup

- As a buyer, I want to plug in my own Stripe keys quickly.
- As a buyer, I want to understand where products, prices, and plan logic are configured.
- As a buyer, I want to run billing locally with Stripe test mode.

## Plans and Pricing

- As a buyer, I want to switch from one-time payment to subscription logic if needed.
- As a buyer, I want to support monthly and yearly pricing.
- As a buyer, I want to add a free plan.
- As a buyer, I want to change feature gating by plan.
- As a buyer, I want to rename plans and pricing labels quickly.

## Checkout and Portal

- As a buyer, I want to customize the checkout experience without digging through unrelated files.
- As a buyer, I want to change upgrade and downgrade behavior.
- As a buyer, I want to support customer portal flows if my product needs them.
- As a buyer, I want to clearly understand where billing redirects and return URLs are defined.

## Webhooks and Subscription State

- As a buyer, I want webhook logic to be structured but understandable.
- As a buyer, I want to know where subscription status is updated.
- As a buyer, I want to add business logic based on subscription events.
- As a buyer, I want billing complexity to stay contained to the billing domain.

---

# 7. Database and Data Model User Stories

## Setup and Local Development

- As a buyer, I want to get the database running quickly.
- As a buyer, I want clear setup, migrate, seed, reset, and studio workflows.
- As a buyer, I want demo data to help me understand the product quickly.

## Schema Changes

- As a buyer, I want to add a new entity without rewriting the starter foundation.
- As a buyer, I want to remove unused entities cleanly.
- As a buyer, I want to rename models and fields safely.
- As a buyer, I want to add relations in a predictable way.

## Access Patterns

- As a buyer, I want to understand where database access happens.
- As a buyer, I want database logic to be easy to trace from UI to server logic.
- As a buyer, I want predictable patterns for queries, mutations, and validation.

---

# 8. UI, Branding, and Design User Stories

## Brand Identity

- As a buyer, I want to replace the logo and product name quickly.
- As a buyer, I want to change colors, typography, and brand accents.
- As a buyer, I want to make the starter visually feel like my company.

## UI Customization

- As a buyer, I want to customize buttons, forms, tables, dialogs, and cards easily.
- As a buyer, I want to restyle dashboard pages without breaking functionality.
- As a buyer, I want to swap icons, avatars, and empty states quickly.
- As a buyer, I want a clean design foundation that does not fight me.

## Product Positioning

- As a buyer, I want to make the product look more premium, more minimal, or more niche-specific.
- As a buyer, I want the starter to be visually convincing enough to use in a real launch.

---

# 9. Landing, Pricing, and Marketing User Stories

## Landing Page

- As a buyer, I want to replace the landing copy with my own message quickly.
- As a buyer, I want to change the hero, features, testimonials, and CTA structure easily.
- As a buyer, I want to remove or add landing sections without touching app logic.

## Pricing Page

- As a buyer, I want to change plans, prices, labels, and feature comparison quickly.
- As a buyer, I want to switch between one-time pricing and subscription messaging if needed.
- As a buyer, I want the pricing page to match my business model with minimal editing.

## Public Content

- As a buyer, I want to update FAQ, legal pages, and public text content fast.
- As a buyer, I want public pages to feel as editable as dashboard pages.

---

# 10. Documentation and Developer Experience User Stories

## Setup

- As a buyer, I want to install and run the starter quickly.
- As a buyer, I want the setup steps to be obvious and tested.
- As a buyer, I want environment variables explained clearly.
- As a buyer, I want to know how to initialize the database without reading the full codebase.

## Customization

- As a buyer, I want docs for common changes:
  - adding or removing auth providers
  - protecting a route
  - editing profile fields
  - adding a dashboard page
  - changing pricing
  - plugging in Stripe
  - changing branding
  - adding a new business feature

## Confidence

- As a buyer, I want to feel safe making changes in the first two hours.
- As a buyer, I want examples that map to real customization jobs.
- As a buyer, I want docs that reduce hesitation, not docs that only describe architecture.

---

# 11. High-Priority "First Two Hours" User Stories

These are the most important stories for product-market fit.

## Critical

- As a buyer, I want to add or remove an auth provider quickly.
- As a buyer, I want to customize the sign-in experience quickly.
- As a buyer, I want to add a new private dashboard page quickly.
- As a buyer, I want to update account/profile fields quickly.
- As a buyer, I want to plug in my own Stripe pricing quickly.
- As a buyer, I want to rename or remove the team/workspace concept quickly.
- As a buyer, I want to restyle the product to match my brand quickly.
- As a buyer, I want to understand the codebase without learning a custom architecture first.

## Conversion Impact

If these stories are easy, the starter becomes much more sellable.  
If these stories are hard, buyers will feel friction even if the code is technically good.

---

# 12. Negative User Stories

These are the experiences the buyer should not have.

- As a buyer, I do not want to search across many files just to add a provider.
- As a buyer, I do not want to learn a private framework before editing a feature.
- As a buyer, I do not want simple CRUD changes to require enterprise patterns.
- As a buyer, I do not want to open ten support files to update one settings form.
- As a buyer, I do not want billing logic mixed into unrelated app areas.
- As a buyer, I do not want marketing pages to be harder to edit than the dashboard.
- As a buyer, I do not want setup docs that assume I already know the project.

---

# 13. Product Promise Translation

These user stories translate into a simple product promise:

- easy to understand
- easy to customize
- easy to launch from
- structured enough for real products
- simple enough to modify fast

This document should be used as a filter for:

- feature design
- documentation priorities
- marketing claims
- starter package decisions
- code review decisions

If a new abstraction makes these stories harder, it should be questioned.  
If a feature makes these stories easier, it is probably valuable.

---

# 14. Recommended Follow-Up Documents

This file should be paired with:

- `docs/02-product/customization-promises.md`
- `docs/04-marketing-sales/easy-to-customize.md`
- `docs/03-architecture/technical-architecture.md`
- `docs/03-architecture/decisions-log.md`

Together, these documents define what the buyer expects, what the product promises, and how the codebase should support those promises.
