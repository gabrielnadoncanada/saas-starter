# Iteration Playbook

## Goal
Improve a SaaS starter through repeated audit loops until it is easier to sell, easier to understand, and easier to customize.

## Loop
1. Run the master audit prompt against the codebase.
2. Read the coding agent's response.
3. Validate the response critically.
4. Convert it into a prioritized correction plan.
5. Generate an implementation prompt.
6. Re-audit after fixes.

## Prioritization order
1. buyer-confusing architecture
2. slow-to-modify patterns
3. weak pricing, gating, or billing extensibility
4. dashboard or UI credibility gaps
5. docs and onboarding gaps
6. secondary feature additions

## Typical false positives in audits
- demanding enterprise layers for ordinary CRUD
- overvaluing testability patterns the buyer will not perceive
- treating extra indirection as architectural maturity
- recommending broad rewrites where local simplification is enough

## Typical blind spots in audits
- poor perceived value at the target price
- missing docs for customization
- weak dashboard credibility
- plans and gating that are hard to extend
- features that exist but feel unfinished or generic
