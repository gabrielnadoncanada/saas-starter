import { isPlanId, type PlanId } from "@/shared/config/billing.config";
import { hasPlanAccess } from "./subscription-status";

type TeamBillingSnapshot = {
  planId: string | null;
  subscriptionStatus: string | null;
};

export function resolveTeamPlan(team: TeamBillingSnapshot | null | undefined): PlanId {
  if (!team || !hasPlanAccess(team.subscriptionStatus)) {
    return "free";
  }

  return team.planId && isPlanId(team.planId) ? team.planId : "free";
}
