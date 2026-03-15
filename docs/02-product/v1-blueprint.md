# V1 Blueprint

## Purpose
Define the exact shape of the first sellable version of the starter.

## V1 principle
V1 is not the smallest codebase possible. V1 is the smallest version that feels complete, current, premium, and worth paying at least 149 USD for.

## Buyer promise
A technical founder should be able to clone the repo, understand the codebase, configure the environment, and begin adapting a serious B2B SaaS without first dismantling a framework-within-a-framework.

## In-scope modules for Starter
1. authentication foundation
2. billing and subscription foundation
3. protected dashboard shell
4. workspace foundation
5. account settings
6. basic onboarding flow
7. landing page and pricing page
8. docs for setup and customization
9. base UI system and app navigation
10. seed and local development baseline

## In-scope modules for Pro
1. everything in Starter
2. extended feature examples or premium blocks
3. deeper documentation and customization guides
4. selected AI-native modules only if they are buyer-visible and easy to understand
5. stronger examples for real B2B SaaS adaptation

## Out of scope for V1
- broad marketplace support
- heavy RBAC matrix
- complex admin backoffice
- multi-provider auth zoo
- background job platform abstraction
- large plugin architecture
- aggressive AI feature sprawl
- enterprise patterns as default architecture

## Build order
### Step 1 — foundation alignment
- validate auth, Prisma, and billing posture against the current stack
- make sure structure stays aligned with `nextjs-saas-structure`
- remove or prevent internal-framework drift

### Step 2 — sellable core flows
- login and protected routes
- workspace creation or workspace attachment
- pricing page and billing entry points
- dashboard shell and account settings

### Step 3 — product credibility
- onboarding flow
- polished default UI states
- docs that reduce setup anxiety
- landing page that matches what the code already proves

### Step 4 — Pro differentiation
- add modules with high perceived value
- expand docs and examples
- package agency or extended rights

## Architecture constraints for V1
- keep `app/` thin
- keep domain logic in `features/`
- keep shared technical infrastructure in `lib/`
- avoid repositories, use-cases, and DI by default
- let complexity earn structure

## Commercial constraints for V1
- Starter must feel useful and credible at 149 USD on its own
- Pro must feel like an acceleration layer, not a ransom layer
- the sales copy must not promise AI-native depth that the codebase does not yet prove

## Exit criteria
- strong setup experience from a clean environment
- clear workspace, auth, and billing flows
- docs good enough for self-serve onboarding
- codebase understandable without private explanations
- enough visible quality to defend premium pricing
