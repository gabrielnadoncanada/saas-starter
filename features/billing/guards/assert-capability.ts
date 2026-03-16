import type { Capability, PlanId } from "../plans";
import { getPlan } from "../plans";
import { UpgradeRequiredError } from "../errors";
import { hasCapability } from "./has-capability";

/**
 * Throws UpgradeRequiredError if the plan does not include the capability.
 * Use in server actions and API routes.
 */
export function assertCapability(
  planId: PlanId,
  capability: Capability,
): void {
  if (!hasCapability(planId, capability)) {
    throw new UpgradeRequiredError(capability, getPlan(planId).name);
  }
}
