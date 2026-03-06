# Agent Rules

## Root Cause First

- Never apply a quick fix when the underlying issue is still broken.
- Always solve the root cause instead of patching symptoms.
- Never choose a workaround if it introduces regression risk or leaves the real fault in place.
- Prefer durable fixes that keep behavior correct across the full flow, not just the failing surface case.
- If a true root-cause fix is blocked by environment or tooling, state the blocker explicitly instead of silently patching around it.

## File Size Limit

- Never create or keep a file with more than 250 lines.
- When a file approaches 250 lines, refactor or split it before adding more code.
  Strict refactor mode.

You must optimize for the cleanest final architecture, not for backward compatibility.

Hard rules:

- Do not preserve legacy behavior unless explicitly requested.
- Do not add compatibility layers.
- Do not add adapters, wrappers, shims, aliases, or fallbacks.
- Do not keep deprecated code paths alive.
- Do not support old and new implementations in parallel.
- Do not make the new implementation conform to outdated patterns.
- Do not leave transitional code for “later”.
- Do not keep optional branches just to avoid updating call sites.

Expected behavior:

- Refactor dependent code to match the new design.
- Replace obsolete structures directly.
- Remove dead, deprecated, or redundant code after replacement.
- Normalize the codebase around one clear approach.
- Prefer a clean breaking internal refactor over a messy compatibility patch.
- If multiple files must change to keep the architecture coherent, change them.

Decision rule:
If the choice is between:

1. preserving legacy compatibility with added complexity
2. performing a clean refactor that breaks old internal usage

choose option 2 by default.

Output standard:

- Final code should reflect the target architecture only.
- No dual implementation.
- No temporary migration layer.
- No defensive support for hypothetical old usage.
- Keep the solution simple, explicit, and maintainable.
