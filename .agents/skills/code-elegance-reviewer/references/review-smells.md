# Review Smells

Use this file when the code looks suspiciously "clean" or structurally heavy for what it actually does.

## 1. Abstraction scaffolding smell

The code introduces support structures whose main job is to keep an abstraction alive:
- custom type only used by one config array
- interface only used to satisfy a refactor that made things indirect
- helper wrappers that only exist because the abstraction expects a shape
- base class or utility layer with no real second consumer

Default judgment:
- count the support structures as part of the abstraction cost
- if removing the abstraction would also remove most of these pieces, the abstraction is likely weak

## 2. Fake DRY smell

The code reduces visible duplication but increases conceptual complexity.

Common forms:
- replacing 3 to 5 explicit blocks with a config array and loop
- consolidating different branches into a generic function with flags
- extracting helpers whose only purpose is to avoid repeated syntax

Default judgment:
- shallow repetition is often cheaper than new indirection
- if each repeated block is easy to read and slightly different, keep it explicit

## 3. Symptom patch smell

The refactor cleans the local code but leaves the actual ownership or data-shape problem untouched.

Examples:
- UI code repeatedly formatting awkward backend data instead of fixing the data contract
- controller code computing business rules because the domain layer is missing
- wrappers added to hide a noisy dependency instead of correcting who owns that dependency

Default judgment:
- identify the upstream cause explicitly
- do not praise a local cleanup as a real architecture improvement when it only repackages the symptom

## 4. Placeholder leakage smell

Temporary data, fake metrics, hardcoded constants, or guessed business rules live in production-facing code.

Examples:
- magic numbers standing in for real domain calculations
- placeholder arrays or counters rendered to users
- date, price, or score calculations embedded directly in views when ownership is unclear

Default judgment:
- call this out as a boundary or ownership problem first
- avoid spending most of the review budget on template prettiness while placeholder logic remains

## 5. Local cleverness tax

The author traded directness for a more "engineered" shape.

Examples:
- one-line helpers with prestigious names
- generic extension points with no realistic extension
- fancy composition that forces the reader to reconstruct the original concrete behavior

Default judgment:
- ask whether the code became easier to understand, not just more elegant-looking
- if the reader must mentally decompile the abstraction, penalize it

## 6. Generic-by-default smell

The code assumes future variability that does not exist yet.

Examples:
- factory with one implementation
- strategy pattern before a second strategy exists
- options object used to hide a narrow concrete API
- generalized pipeline for a single workflow

Default judgment:
- prefer concrete code until real variation is present
- future-proofing is not free; count the ongoing reading tax

## 7. Convenience-wrapper smell

A wrapper adds naming or indirection without enough meaning.

Examples:
- helper returning a constant label
- wrapper around a standard library call with no policy
- formatter function that only restates built-in behavior

Default judgment:
- wrappers should carry policy, shared intent, or true reuse
- if they only rename the obvious, they are likely noise

## 8. Overtyping smell

Extra types appear only because the refactor added an abstraction.

Examples:
- local type alias for a tiny one-off config list
- interface created solely to make a map or loop compile nicely
- generic parameter that communicates no domain truth

Default judgment:
- types should explain domain boundaries or contracts
- if the type exists only to prop up indirection, count it as complexity

## 9. Fragmentation smell

Understanding one simple behavior requires opening too many files or jumping across helpers.

Default judgment:
- merging can be a simplification
- tiny files are not automatically clean

## 10. Review questions that force honesty

Ask these before praising a refactor:
- what actual future change became easier?
- what real bug vector was removed?
- what concept became clearer?
- what code can now be deleted entirely?
- if this abstraction disappeared, would the code become easier to read?
- is this solving a repetition problem or an ownership problem?
- is this code honest about where the business rule belongs?

If the answers are weak, the refactor is probably weak.
