import type { PlanId } from "./plans";

/**
 * Maps Stripe product names (from your Stripe dashboard) to internal plan IDs.
 *
 * When Stripe syncs a subscription, the product name stored in `team.planName`
 * is looked up here to resolve the internal plan. This is the *only* place
 * where Stripe naming touches plan logic.
 *
 * To add a new plan:
 *   1. Create the product in Stripe
 *   2. Add its name here
 *   3. Define the plan in plans.ts
 */
const stripeProductToPlan: Record<string, PlanId> = {
  Base: "pro",
  Pro: "pro",
  Plus: "team",
  Team: "team",
};

const DEFAULT_PLAN: PlanId = "free";

export function resolvePlanFromStripeName(
  stripePlanName: string | null | undefined,
): PlanId {
  if (!stripePlanName) return DEFAULT_PLAN;
  return stripeProductToPlan[stripePlanName] ?? DEFAULT_PLAN;
}
