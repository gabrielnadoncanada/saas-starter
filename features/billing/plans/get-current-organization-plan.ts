import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import type { PlanId, PricingModel } from "@/shared/config/billing.config";

import { resolveOrganizationPlan } from "./resolve-organization-plan";

type CurrentOrganizationPlan = {
  planId: PlanId;
  organizationId: string;
  organizationName: string;
  subscriptionStatus: string | null;
  pricingModel: PricingModel;
};

export async function getCurrentOrganizationPlan(): Promise<CurrentOrganizationPlan | null> {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return null;
  }

  return {
    planId: resolveOrganizationPlan(organization),
    organizationId: organization.id,
    organizationName: organization.name,
    subscriptionStatus: organization.subscriptionStatus,
    pricingModel: (organization.pricingModel as PricingModel) ?? "flat",
  };
}
