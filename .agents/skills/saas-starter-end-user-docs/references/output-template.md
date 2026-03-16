# Output Template

Use this response structure unless the user requests a narrower output.

## Final doc
Provide the end-user markdown document first.

## Complexity scorecard
- Time to find where to edit: X/5
- Number of files to modify: X/5
- Architecture explanation required: X/5
- Locality of change: X/5
- Buyer confidence after reading: X/5
- Total: X/25
- Verdict: excellent / good / borderline / simplify code first

## Flags
List red flags only when present. Examples:
- Too many files for a common buyer task
- Action starts too late because architecture explanation comes first
- The guide compensates for scattered logic
- Feature-local change requires global edits

## Simplification recommendation
Recommend the smallest code or structure change that would make the guide shorter, more local, and easier for the buyer.

If the task is naturally complex and the current implementation is acceptable, say that explicitly.
