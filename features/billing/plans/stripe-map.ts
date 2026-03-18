import type { PlanId } from "./plans";
import { isPlanId } from "./plans";

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
  base: "pro",
  pro: "pro",
  plus: "team",
  team: "team",
};

const DEFAULT_PLAN: PlanId = "free";

function normalizeStripeProductName(
  stripePlanName: string | null | undefined,
): string | null {
  const normalized = stripePlanName?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export function resolvePlanFromStripeName(
  stripePlanName: string | null | undefined,
): PlanId {
  const normalizedName = normalizeStripeProductName(stripePlanName);

  if (!normalizedName) {
    return DEFAULT_PLAN;
  }

  return stripeProductToPlan[normalizedName] ?? DEFAULT_PLAN;
}

export function resolvePlanFromStripeProduct(input: {
  name: string | null | undefined;
  metadata: Record<string, string> | null | undefined;
}): PlanId {
  const metadataPlanId = normalizeStripeProductName(input.metadata?.plan_id);

  if (metadataPlanId && isPlanId(metadataPlanId)) {
    return metadataPlanId;
  }

  return resolvePlanFromStripeName(input.name);
}
