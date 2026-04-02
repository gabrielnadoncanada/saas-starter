import {
  LimitReachedError,
  UpgradeRequiredError,
} from "../errors/billing-errors";
import type { Capability, LimitKey, PlanId } from "../plans";
import { getPlan } from "../plans";

export function hasCapability(planId: PlanId, capability: Capability): boolean {
  return getPlan(planId).capabilities.includes(capability);
}

export function getPlanLimit(planId: PlanId, limitKey: LimitKey): number {
  return getPlan(planId).limits[limitKey];
}

/**
 * Throws UpgradeRequiredError if the plan does not include the capability.
 * Use in server actions and API routes.
 */
export function assertCapability(planId: PlanId, capability: Capability): void {
  if (!hasCapability(planId, capability)) {
    throw new UpgradeRequiredError(capability, getPlan(planId).name);
  }
}

/**
 * Throws LimitReachedError if currentUsage >= the plan's limit.
 * Use in server actions and API routes.
 */
export function assertLimit(
  planId: PlanId,
  limitKey: LimitKey,
  currentUsage: number,
): void {
  const limit = getPlanLimit(planId, limitKey);

  if (currentUsage >= limit) {
    throw new LimitReachedError(
      limitKey,
      limit,
      currentUsage,
      getPlan(planId).name,
    );
  }
}

/**
 * Non-throwing limit check. Returns a status object for UI-friendly usage.
 */
export function checkLimit(
  planId: PlanId,
  limitKey: LimitKey,
  currentUsage: number,
) {
  const limit = getPlanLimit(planId, limitKey);

  return {
    allowed: currentUsage < limit,
    limit,
    currentUsage,
    remaining: Math.max(0, limit - currentUsage),
  };
}
