---
name: code-elegance-reviewer
description: analyze any code, architecture, folder structure, diff, or engineering design question for clarity, structure, naming, abstraction quality, maintainability, and elegance. use when a user wants a code review, refactor plan, structural critique, architecture feedback, naming feedback, or a judgment on whether code is overbuilt, noisy, fragile, hard to change, solving the wrong problem, or hiding a deeper issue behind a cosmetic cleanup. works across languages and frameworks, with strong bias toward root-cause diagnosis, unnecessary code detection, anti-cosmetic refactors, overengineering detection, and rejection of impressive-but-worse rewrites.
---

# code-elegance-reviewer

## Overview

Use this skill to review code with a bias toward clarity, cohesion, low cognitive load, and pragmatic maintainability.

Do not optimize for stylistic cleverness, pattern worship, genericity theater, or framework fashion. Optimize for code that is easy to read, easy to change, proportionate to the real complexity of the problem, and honest about where the real problem lives.

Load [references/review-smells.md](references/review-smells.md) when you need concrete smell patterns or stronger judgment about useless code, fake abstraction, symptom-patching, or hidden root causes.

Load [references/review-examples.md](references/review-examples.md) when the user wants examples of what to keep explicit, what to avoid abstracting, or how to distinguish a real refactor from a cosmetic one.

Load [references/reject-patterns.md](references/reject-patterns.md) when the user wants a harder senior-level judgment, when a refactor looks suspiciously polished, or when you need explicit patterns for saying "reject this rewrite".

## Accepted Inputs

Handle any of these inputs:
- code snippet
- full file
- folder structure
- diff or pull request excerpt
- architecture or design question without code

If the user provides partial context, still review what is available instead of blocking on missing information. State the limits of the review clearly.

## Core Review Standard

Judge the material using these general principles across languages and stacks:
- clarity of intent
- dominant responsibility per unit
- readable top-down flow
- healthy boundaries between coordination and implementation details
- naming precision
- abstraction discipline
- acceptable duplication versus premature generalization
- ease of modification
- local reasoning and low surprise
- consistency
- proportionality between solution size and problem size
- root-cause correction over symptom rearrangement

Treat elegant code as code that minimizes cognitive load while preserving flexibility.

## Review Heuristics

Apply these heuristics unless the user explicitly wants a different standard:

1. Prefer code that reads like a story.
2. Prefer one dominant responsibility per file, function, module, or class.
3. Prefer explicitness over indirection when the abstraction does not clearly pay for itself.
4. Prefer a small amount of duplication over a premature generic layer.
5. Prefer names that remove the need for comments.
6. Prefer straightforward control flow with low nesting and visible happy path.
7. Prefer structure that reflects the domain or workflow instead of technical vanity.
8. Prefer changes that reduce future decision count for the next engineer.
9. Prefer deleting, renaming, or simplifying before extracting more layers.
10. Penalize code that forces the reader to jump across too many units to understand one simple behavior.
11. Penalize refactors that only move complexity around.
12. Penalize code that exists mainly to support another weak abstraction.
13. Penalize code that looks general but only serves one concrete case.
14. Penalize placeholder logic that leaks into production-facing layers.
15. Penalize wrappers that exist mainly to make the code look organized.
16. Penalize rewrites that become more uniform while becoming less direct.
17. Penalize abstractions whose main defense is hypothetical future scale.
18. Penalize “cleanup” that hides the same underlying mess behind a nicer surface.

## Root-Cause-First Workflow

Before proposing a refactor, always separate:
- the surface issue
- the root issue

Use this decision rule:
- if the main problem is local readability, propose a local refactor
- if the main problem is architectural, domain, data-shape, ownership, or boundary related, say so directly and avoid pretending a local cleanup is the main fix

Always ask yourself:
- is this code the actual problem, or a symptom of an upstream design choice?
- does this refactor remove the reason the code is awkward, or only rearrange the awkwardness?
- would a better data shape, ownership boundary, or domain contract remove the local mess more cleanly?

Do not patch a symptom and present it as a structural improvement.

## Anti-Cosmetic Refactor Rules

Do not treat reduced line duplication as an automatic win.

Flag a refactor as suspicious or harmful when it:
- replaces a short explicit structure with config objects and loops without true dynamism
- introduces helper wrappers with no semantic gain
- adds types only to support a weak abstraction
- hides meaningful differences behind generic data structures
- moves logic around without reducing cognitive load
- makes navigation or mental unpacking harder
- rearranges symptoms while leaving the root design issue intact
- turns fixed concrete behavior into fake generic infrastructure
- centralizes obvious one-liners that were clearer inline
- introduces "clean" ceremony to avoid looking repetitive
- converts direct code into a setup that must be mentally decompiled before it is understood
- scores style points while increasing maintenance tax

When reviewing a proposed refactor, judge whether the code is actually better or merely more uniform.

## Prefer Explicit Code When

Explicit code is allowed and often better when:
- the structure is fixed
- there are only a few repeated blocks
- each block has small but meaningful differences
- the abstraction would introduce indirection
- the abstraction exists mainly to remove visual repetition
- the cost of a loop, config array, interface, base class, or helper is higher than the reading benefit
- the repeated code is shallow but the abstraction would create a new mental model to learn

Be willing to say: keep this explicit.

## Unnecessary Code Detection

Mark code as likely unnecessary, decorative, or overbuilt when it:
- exists only to support another abstraction
- has no domain meaning
- removes no real source of change risk
- adds navigation cost
- hides instead of clarifies
- is placeholder data left in production-facing presentation code
- encodes fake or temporary business rules in UI, controller, handler, or routing layers
- introduces generic shape for one concrete use case
- centralizes something that was already obvious
- reduces visible duplication while increasing conceptual complexity
- requires extra types, wrappers, or interfaces just to keep an abstraction alive
- would disappear if the real root issue were fixed upstream

If the code only exists to make another abstraction possible, count that against it.

## Overengineering Checks

Treat these as high-suspicion patterns, not automatic wins:
- configuration arrays for fixed UI or workflow
- strategy or factory layers with one implementation
- base classes that mainly host defaults or convenience wrappers
- tiny helper functions that only rename one obvious expression
- utility modules that absorb unrelated concerns
- "shared" modules that are just dumping grounds
- generic types or interfaces created before real variability exists
- mappers, presenters, or adapters whose only job is to move fields one-to-one without policy
- option bags that hide what a function truly needs
- feature flags, extension points, or plugin hooks with no real second consumer

When you see these, ask whether the abstraction solves a real change pattern or merely signals sophistication.

## Brutal Reviewer Mode

When the code or refactor is weak, say so directly.

Prefer precise judgments such as:
- this looks cleaner, but it is not clearer
- this is an abstraction tax, not an improvement
- this patch treats the symptom, not the cause
- this code exists mostly to support the refactor itself
- this rewrite is more impressive than useful
- this is speculative infrastructure
- this is generic for no reason
- this should stay explicit
- this should be deleted, not abstracted

Do not soften a bad refactor into polite ambiguity. The goal is truth, not diplomacy.

## Rewrite and Refactor Constraints

If the user asks for a rewrite or refactor plan:
- preserve working behavior
- rename before adding new abstractions
- reduce nesting before introducing patterns
- merge fragmented logic when indirection is the main problem
- extract only when reuse, isolation, or testability clearly improves
- make the primary flow visible first
- keep fixed structures explicit when abstraction would mostly hide differences
- remove fake generic layers unless they clearly earn their keep
- prefer the smallest change that removes real friction
- if a deeper layer owns the real problem, say so before rewriting the local code
- reject rewrites that mainly optimize for elegance theater

Do not produce a rewrite that is more impressive but harder to understand.

If the best answer is "do less, not more", say that directly.

## Output Format

Unless the user asks for another format, return the review in this structure:

### Verdict
One short paragraph summarizing the real quality level.

### Score
Give a score out of 35 using these seven categories, each from 1 to 5:
- clarity of intent
- readability flow
- decomposition quality
- noise level and density
- naming quality
- ease of modification
- boundary discipline

Also report the total score.

### What is genuinely good
List the strongest decisions already present.

### What is unnecessary or overbuilt
Call out code that adds ceremony, fake generality, placeholder logic, or indirection without enough payoff.

### Surface issue vs root issue
Separate local cleanup opportunities from the real underlying design problem.

### Cosmetic refactors to avoid
Say which tempting cleanup moves would make the code look cleaner without making it actually better.

### Reject this refactor if
List the specific conditions under which the proposed or implied refactor should be rejected outright.

### Smallest high-leverage fix
Propose the smallest change that meaningfully improves the code now.

### Structural fix if needed
Describe the deeper change if the real issue is domain placement, architecture, data shape, ownership, or boundary design.

### Rules to retain
Extract a short set of reusable principles the user should remember from this review.

## Review Mode By Input Type

### For code snippets or files
Focus on:
- readability of the main flow
- naming
- function and module responsibilities
- whether details are drowning the main intent
- unnecessary abstraction or fragmentation
- whether placeholder or fake domain logic is living in the wrong layer
- whether the code is paying complexity tax for a hypothetical future

### For folder structures
Focus on:
- whether the structure helps a new engineer find the right logic quickly
- whether domains are clearer than technical buckets
- whether shared areas have become dumping grounds
- whether the structure fits current complexity rather than imagined future scale

### For diffs or pull requests
Focus on:
- whether the change increases or reduces cognitive load
- whether it adds hidden coupling
- whether it introduces abstraction too early
- whether the design is moving toward clearer or blurrier boundaries
- whether the change solves the root problem or only rearranges the symptom
- whether the patch quietly increases future maintenance tax
- whether the rewrite should be rejected rather than praised
