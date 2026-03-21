import { getCurrentOrganization } from "@/features/teams/server/current-organization";
import type { PlanId, PricingModel } from "../plans";
import { resolveTeamPlan } from "../plans";

type TeamPlanInfo = {
  planId: PlanId;
  organizationId: string;
  teamName: string;
  subscriptionStatus: string | null;
  pricingModel: PricingModel;
};

/**
 * Resolves the current team's plan from their Stripe subscription.
 * Returns null if no team is found (user not authenticated or no team).
 */
export async function getTeamPlan(): Promise<TeamPlanInfo | null> {
  const organization = await getCurrentOrganization();

  if (!organization) return null;

  return {
    planId: resolveTeamPlan(organization),
    organizationId: organization.id,
    teamName: organization.name,
    subscriptionStatus: organization.subscriptionStatus,
    pricingModel: (organization.pricingModel as PricingModel) ?? "flat",
  };
}
