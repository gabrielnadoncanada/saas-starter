import type { PlanId } from "./plans";
import { resolvePlanFromStripeName } from "./stripe-map";
import { hasPlanAccess } from "./subscription-status";

type TeamBillingSnapshot = {
  planId: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
};

export function resolveTeamPlan(team: TeamBillingSnapshot | null | undefined): PlanId {
  if (!team || !hasPlanAccess(team.subscriptionStatus)) {
    return "free";
  }

  if (team.planId === "free" || team.planId === "pro" || team.planId === "team") {
    return team.planId;
  }

  return resolvePlanFromStripeName(team.planName);
}
