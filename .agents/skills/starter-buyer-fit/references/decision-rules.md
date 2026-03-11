# Decision Rules

## 1. Use buyer-facing value as the main filter

For this starter, prefer decisions that improve at least one of:
- speed to first edit
- speed to first launch
- confidence while modifying
- visible code clarity

Reject decisions whose main value is only:
- internal elegance
- test sophistication not sold to the buyer
- future-proofing without current evidence
- architectural symmetry

## 2. Separate structural validity from commercial fit

A decision can be structurally correct and still be the wrong fit for the product.

Examples:
- dependency injection in feature server logic may be clean, but often feels unnecessary in an indie starter
- multiple type layers may be disciplined, but often reduce perceived approachability
- repositories may be familiar to some developers, but they slow most buyers in this market

Always judge both:
1. is it technically valid?
2. is it the right level for this buyer?

## 3. Use this complexity ladder

### Level 1: direct feature work
Examples:
- profile settings
- delete account
- update organization name
- create invoice
- basic dashboard filters

Default:
- direct feature-owned logic
- minimal support files
- clear schemas and actions
- no DI by default

### Level 2: moderate workflow complexity
Examples:
- invitation acceptance
- onboarding completion
- role-based update rules
- multi-step mutation with audit logging

Default:
- preserve thin boundaries
- allow a few more helper files
- keep the main flow obvious
- avoid enterprise naming and layers

### Level 3: infrastructure-heavy or risk-heavy flows
Examples:
- Stripe subscription state
- webhook processing
- permissions and tenancy edge cases
- external provider sync
- storage pipelines
- recovery flows

Default:
- more structure is acceptable
- dedicated helpers are acceptable
- stronger separation may be justified
- still avoid needless "platform" patterns unless complexity is sustained

## 4. Apply the one-minute rule

A capable buyer should understand the main flow of a standard feature in about one minute.

If understanding the flow requires opening many support files just to answer:
- where input enters
- where validation happens
- where business logic runs
- where the database is touched

then the design is drifting away from buyer fit.

## 5. Use the “would most buyers thank you for this?” test

For any abstraction, ask:
- would most buyers appreciate this after a quick scan?
- would it make a common edit faster?
- would removing it make the starter easier to sell?

If the answer is unclear, simplify.

## 6. Prefer these moves over heavier architecture

Prefer:
- one well-named function over a service class
- one local helper over a generalized framework utility
- one direct import over dependency scaffolding
- one feature-local pattern over a global standard too early
- one obvious wrapper over stacked wrappers

## 7. Watch for stealth enterprise signals

These often signal overbuild for this audience:
- repository layers by default
- command or use-case objects for standard feature logic
- many tiny files whose only job is indirection
- helpers named too abstractly to reveal actual behavior
- strict patterns applied to every feature regardless of complexity
- abstractions justified mainly by "future scalability"

## 8. When keeping sophistication is justified

Keep the extra structure when all three are true:
1. the complexity is real and recurring
2. the abstraction makes future edits meaningfully safer or faster
3. the pattern is still learnable without reading internal docs first

If one of these fails, simplify first.
