import type { LimitKey, PlanId } from "../plans";
import { getPlanLimit } from "./get-plan-limit";

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
