# SaaS Starter Audit Loop

## Goal
Iteratively improve the SaaS starter until it becomes highly sellable to solo founders, consultants, and small technical teams at the target price point.

## Success Criteria
The loop continues until the starter is judged strong on these dimensions:
- buyer fit
- time to understand
- time to modify
- cognitive simplicity
- feature credibility
- perceived value at the target price
- differentiation
- launch readiness

## Working Loop
1. Run the master audit prompt against the current codebase.
2. Paste the audit response into ChatGPT using the SaaS starter iteration workflow.
3. Convert the audit into:
   - validated findings
   - reprioritized fixes
   - implementation prompt for the coding agent
4. Apply the fixes.
5. Re-run the same audit prompt.
6. Record what changed.
7. Repeat.

## Decision Rules
- Prefer obviousness over purity.
- Keep boundaries, remove ceremony.
- Complexity must earn its structure.
- If an abstraction needs explanation before it saves time, it is suspicious.
- If a buyer would struggle to modify a feature quickly, treat it as a sellability problem.

## Iteration Log Template

### Iteration N
**Audit date:** YYYY-MM-DD

**Main verdict:**
- not sellable
- sellable with important fixes
- good but not differentiated enough
- strong and sellable
- excellent and hard to compete with

**Top issues found:**
1. 
2. 
3. 

**Fixes applied:**
1. 
2. 
3. 

**Remaining blockers:**
1. 
2. 
3. 

**Next action:**

