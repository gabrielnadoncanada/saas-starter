import type { LimitKey, PlanId } from "../plans";
import { getPlan } from "../plans";
import { LimitReachedError } from "../errors";
import { getPlanLimit } from "./get-plan-limit";

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
    throw new LimitReachedError(limitKey, limit, currentUsage, getPlan(planId).name);
  }
}
