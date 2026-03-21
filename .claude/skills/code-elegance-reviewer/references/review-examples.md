# Review Examples

Use these examples to keep reviews concrete and to avoid praising cosmetic cleanup.

## Example 1: Fixed blocks vs config array

### Before
Four explicit render blocks, each short, each slightly different.

### Tempting refactor
Replace them with:
- a config array
- a loop
- a local type
- a shared helper shape

### Better judgment
Do not assume the refactor is better.

If:
- the blocks are fixed
- there are only a few of them
- each one has small differences
- the new abstraction needs support types or wrappers

Then likely verdict:
- keep the explicit blocks
- reduce local duplication only where it has real semantic value
- avoid trading directness for uniformity

## Example 2: View cleanup vs ownership problem

### Before
A UI file contains formatting logic, placeholder values, and a guessed business rule.

### Tempting review
Suggest a prettier local structure.

### Better judgment
The local structure may be secondary. The real issue may be:
- placeholder data leaking into presentation
- business logic living in the wrong layer
- data contract too raw for the consumer

Then the review should say:
- surface issue: local readability can improve
- root issue: ownership and data-shape are wrong
- do not present a view-only cleanup as the primary fix

## Example 3: Generic helper that saves no real effort

### Before
An obvious built-in call appears twice.

### Tempting refactor
Wrap it in `formatSomething()` or `getSomethingLabel()`.

### Better judgment
If the helper adds no policy, domain language, reuse leverage, or future safety, keep the original inline.

## Example 4: Strategy pattern with one strategy

### Before
One concrete implementation.

### Tempting refactor
Introduce strategy interface, default strategy, resolver, registry.

### Better judgment
That is usually speculative infrastructure. Ask for real variation first.

## Example 5: Mapping layer that only renames fields

### Before
Data is passed directly with a couple of clear names.

### Tempting refactor
Add mapper/presenter/adapter that mostly copies fields one-to-one.

### Better judgment
If the layer adds no policy and no protection from drift, it is likely ceremony.

## Review language that is valid

Use phrases like:
- this looks cleaner, but it is not clearer
- this abstraction adds more machinery than understanding
- this is solving visual duplication, not conceptual duplication
- the code is paying a tax for hypothetical flexibility
- the patch improves presentation, not ownership
- this support code disappears if the weak abstraction disappears

## Review language to avoid

Avoid empty phrases like:
- this is more scalable
- this is cleaner
- this improves architecture

unless you explain exactly what future change becomes easier and why.
