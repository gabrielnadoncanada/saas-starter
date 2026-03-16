import type { LimitKey, PlanId } from "../plans";
import { getPlan } from "../plans";

export function getPlanLimit(planId: PlanId, limitKey: LimitKey): number {
  return getPlan(planId).limits[limitKey];
}
