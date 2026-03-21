# Reject Patterns

Use this file when a rewrite or refactor looks polished but smells wrong.

## 1. Config-array rewrite for fixed structure

Reject when:
- the rendered or executed structure is fixed
- there are only a few items
- each item has slightly different behavior
- the rewrite introduces local types, wrappers, or helper shapes to support the loop

Reason:
- this reduces visible duplication but increases indirection
- the reader must reconstruct the concrete behavior from data and helpers

Default judgment:
- keep the explicit blocks

## 2. Abstraction-support code explosion

Reject when the rewrite adds multiple support pieces whose only real job is to make the abstraction possible:
- local type aliases
- helper wrappers
- conversion layers
- base utilities
- one-off interfaces

Reason:
- the support code is part of the abstraction cost
- if removing the abstraction deletes most of the new code, the rewrite is likely weak

## 3. Symptom cleanup sold as architecture

Reject when the patch improves local shape but not true ownership.

Examples:
- UI still owns business rules, just in a tidier structure
- controller still patches a broken data contract, just with helpers
- raw data is still awkward, just hidden behind mappers

Reason:
- the core problem remains upstream
- the patch should not be praised as a structural win

## 4. Generic future-proofing with no second case

Reject when the rewrite introduces:
- strategy pattern with one strategy
- factory with one product
- extension hook with one consumer
- generalized pipeline for one workflow

Reason:
- this is hypothetical flexibility with current reading tax

## 5. Helper prestige

Reject when helpers have serious names but trivial bodies.

Examples:
- wrapper around one built-in call with no policy
- function returning one translation or constant label
- convenience method that only saves a couple obvious tokens

Reason:
- semantic gain is too small for the indirection introduced

## 6. Fragment-to-look-clean rewrite

Reject when a simple behavior now requires multiple jumps across files, functions, or components to understand.

Reason:
- fragmentation is not the same as separation of responsibility
- some code should remain local for readability

## 7. One-to-one mapping theater

Reject when a new mapper, presenter, adapter, or DTO mostly copies fields directly without policy, protection, normalization, or domain meaning.

Reason:
- this is movement without transformation
- it adds maintenance points without adding truth

## 8. Reviewer honesty prompts

Ask these before accepting a rewrite:
- what real future change became easier?
- what real bug vector was removed?
- what concept became clearer?
- what code became deletable?
- would I keep this rewrite if I had to maintain it for a year?
- if I delete the abstraction, does the code become more honest?

If the answers are weak, reject the rewrite.

## Useful language

Use precise language such as:
- reject this refactor
- this rewrite adds machinery without leverage
- this is a style upgrade and a design downgrade
- this abstracts the syntax, not the concept
- this patch is hiding the same problem behind better symmetry
- this is not more maintainable, only more ceremonious
