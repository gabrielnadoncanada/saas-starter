import type { Capability, PlanId } from "../plans";
import { getPlan } from "../plans";

export function hasCapability(planId: PlanId, capability: Capability): boolean {
  return getPlan(planId).capabilities.includes(capability);
}
