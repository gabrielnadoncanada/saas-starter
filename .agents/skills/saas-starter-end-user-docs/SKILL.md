---
name: saas-starter-end-user-docs
description: generate end-user documentation for this next.js saas starter and review draft docs for buyer-facing clarity, customization simplicity, and sellability. use when writing setup guides, customization guides, faq/help docs, or reviewing whether a guide is too long or too hard for a common buyer task. also use when a document should flag structural code complexity and recommend simplifying the implementation before expanding the docs.
---

# Saas Starter End User Docs

## Overview

Generate buyer-facing documentation for this SaaS starter with a consistent structure, practical steps, and low cognitive overhead.

This skill has two jobs:
1. write clean end-user docs that help a buyer move fast
2. detect when documentation difficulty is actually a code structure problem

Treat documentation as a product signal. If a common buyer task is hard to document simply, assume the implementation may be too indirect, too fragmented, or too abstract.

## Core stance

Optimize every document for:
- time to understand
- time to modify
- time to ship
- buyer confidence
- obvious edit paths

Do not use docs to justify unnecessary complexity. If the guide becomes a mini architecture lesson for a common task, flag the implementation.

## Inputs this skill handles

Use this skill when the user provides any of the following:
- a doc task such as "write an end-user doc for adding an auth provider"
- one or more code files or a feature area to document
- a draft guide to review and simplify
- a request to judge whether a task is too complex for the buyer

The input may include repo files, draft markdown, or only the requested task.

## Required output

Unless the user asks for something narrower, produce all of the following:

1. **Final Markdown doc**
   - ready to place in `docs/`
   - written for a paying buyer, not for internal architects

2. **Complexity scorecard**
   - use the five-category scoring model from `references/doc-review-checklist.md`
   - include total score and verdict

3. **Flags**
   - list any red flags that indicate the doc is compensating for structural complexity

4. **Simplification recommendation**
   - if the guide is borderline or worse, recommend the smallest code/design change that would make the doc shorter, more local, and more obvious

## Writing rules

For end-user docs:
- lead with the buyer job, not theory
- keep steps concrete and ordered
- name exact files when known
- prefer local edit paths
- keep explanations short before action begins
- use examples only when they reduce uncertainty
- avoid abstract pattern language unless the buyer truly needs it

For review outputs:
- be explicit when the implementation is the problem
- separate natural complexity from self-inflicted complexity
- recommend simplification before writing a long guide for a common task

## Default doc template

Use this template for most end-user guides:

```md
# Document Title

## Purpose
...

## Audience
...

## When to Use This
...

## Expected Outcome
...

## Files to Edit
- `...`

## Steps
### Step 1 — ...
...

## Example
...

## Common Mistakes
- ...

## Related Documents
- `...`
```

Only add sections if they materially help the buyer.

## Complexity judgment workflow

When generating or reviewing a guide:

1. identify the buyer task
2. decide whether it is a common buyer task or a naturally complex task
3. draft the guide in recipe form
4. score it using `references/doc-review-checklist.md`
5. compare against the deeper rules in `references/doc-complexity-rules.md`
6. if the guide is too long, too scattered, or too architecture-heavy for the task, flag the implementation
7. recommend the smallest refactor or structure change that would improve the doc

## Hard rules

For common buyer tasks, treat these as warning signs:
- more than 8 steps
- more than 4 files touched
- long theory before action starts
- scattered logic across unrelated folders
- custom starter-specific abstractions needed before the buyer can act

When two or more warning signs appear, say clearly that the implementation should be simplified before the docs expand further.

## Output format

When the user asks for a doc, use this structure in the response:

### Final doc
Provide the markdown content.

### Complexity scorecard
- Time to find where to edit: X/5
- Number of files to modify: X/5
- Architecture explanation required: X/5
- Locality of change: X/5
- Buyer confidence after reading: X/5
- Total: X/25
- Verdict: excellent / good / borderline / simplify code first

### Flags
- Flag 1
- Flag 2

### Simplification recommendation
Describe the smallest change to the code structure or feature layout that would make this guide easier for the buyer.

If the task is naturally complex and the implementation is still appropriate, say so explicitly instead of forcing a simplification recommendation.

## References

Read these files when needed:
- `references/doc-complexity-rules.md` for the deeper standard and escalation rules
- `references/doc-review-checklist.md` for the short operational checklist and scorecard

