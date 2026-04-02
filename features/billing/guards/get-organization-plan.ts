import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import type { PlanId, PricingModel } from "@/shared/config/billing.config";

import { resolveOrganizationPlan } from "../plans/resolve-organization-plan";

type OrganizationPlanInfo = {
  planId: PlanId;
  organizationId: string;
  organizationName: string;
  subscriptionStatus: string | null;
  pricingModel: PricingModel;
};

/**
 * Resolves the current organization's plan from its Stripe subscription.
 * Returns null if no organization is found.
 */
export async function getOrganizationPlan(): Promise<OrganizationPlanInfo | null> {
  const organization = await getCurrentOrganization();

  if (!organization) return null;

  return {
    planId: resolveOrganizationPlan(organization),
    organizationId: organization.id,
    organizationName: organization.name,
    subscriptionStatus: organization.subscriptionStatus,
    pricingModel: (organization.pricingModel as PricingModel) ?? "flat",
  };
}
