# How to Change Plan Gating

## Purpose

Control which features are visible or usable based on the team's billing plan.

## Files to Edit

- `features/billing/config/billing.config.ts` - add/remove capabilities, register limit keys, and change limits per plan
- The server action or page you want to gate

## How It Works

Plan definitions live in `features/billing/config/billing.config.ts`. Each plan lists its capabilities and limits. Guards in `features/billing/guards/` check the current team's plan against these definitions.

**Stripe does not control what a plan gives access to.** Stripe only determines which plan is active. All gating logic lives in your application code.

## Steps

### Step 1 - Gate a feature by capability

Use `assertCapability()` in a server action to block access:

```ts
import { getTeamPlan, assertCapability } from "@/features/billing/guards";
import { UpgradeRequiredError } from "@/features/billing/errors";

const teamPlan = await getTeamPlan();
try {
  assertCapability(teamPlan.planId, "task.export");
} catch (error) {
  if (error instanceof UpgradeRequiredError) {
    return { error: error.message };
  }
  throw error;
}
```

For UI gating, use `hasCapability()`:

```tsx
import { hasCapability } from "@/features/billing/guards";

{!hasCapability(planId, "task.export") && <UpgradeCard feature="Export" />}
```

### Step 2 - Gate a feature by usage limit

Use `assertLimit()` to pre-check and `consumeMonthlyUsage()` when the action succeeds:

```ts
import { getTeamPlan, assertLimit } from "@/features/billing/guards";
import { consumeMonthlyUsage, getMonthlyUsage } from "@/features/billing/usage";

const teamPlan = await getTeamPlan();
const usage = await getMonthlyUsage(teamPlan.teamId, "tasksPerMonth");
assertLimit(teamPlan.planId, "tasksPerMonth", usage);

await consumeMonthlyUsage(teamPlan.teamId, "tasksPerMonth", teamPlan.planId);
```

For UI, use `checkLimit()` to get a non-throwing status:

```tsx
import { checkLimit } from "@/features/billing/guards";

const status = checkLimit(planId, "tasksPerMonth", currentUsage);
// status.allowed, status.remaining, status.limit
```

### Step 3 - Add a new gated capability

1. Add the key to the `capabilities` array in `features/billing/config/billing.config.ts`
2. Add it to the relevant plans in `features/billing/config/billing.config.ts`
3. Use `assertCapability()` or `hasCapability()` where needed

### Step 4 - Add a new usage limit

1. Add the key to the `limitKeys` array in `features/billing/config/billing.config.ts`
2. Set its value in each plan in `features/billing/config/billing.config.ts`
3. Use `assertLimit()` or `checkLimit()` where needed
4. Reserve usage with `consumeMonthlyUsage()` in the action that creates the billed resource

## Common Mistakes

- Gating in the UI only - always enforce in server actions too
- Using `if (planId === "pro")` directly instead of the guard system
- Forgetting to reserve usage in the action that creates the billed resource

## Complexity Scorecard

- Time to find where to edit: 5/5
- Number of files to modify: 5/5
- Architecture explanation required: 4/5
- Locality of change: 5/5
- Buyer confidence after reading: 5/5
- Total: 24/25
- Verdict: excellent

## Related Documents

- `how-to-add-a-free-plan.md`
- `how-to-change-stripe-products-and-prices.md`
- `../../03-understanding-the-starter/billing-architecture.md`
