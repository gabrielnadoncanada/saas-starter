import { getCurrentTeam } from "@/features/teams/server/current-team";
import type { PlanId } from "../plans";
import { resolvePlanFromStripeName } from "../plans";

type TeamPlanInfo = {
  planId: PlanId;
  teamId: number;
  teamName: string;
  subscriptionStatus: string | null;
};

/**
 * Resolves the current team's plan from their Stripe subscription.
 * Returns null if no team is found (user not authenticated or no team).
 */
export async function getTeamPlan(): Promise<TeamPlanInfo | null> {
  const team = await getCurrentTeam();

  if (!team) return null;

  return {
    planId: resolvePlanFromStripeName(team.planName),
    teamId: team.id,
    teamName: team.name,
    subscriptionStatus: team.subscriptionStatus,
  };
}
