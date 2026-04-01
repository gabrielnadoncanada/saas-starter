import { isPlanId, type PlanId } from "@/shared/config/billing.config";

import { hasPlanAccess } from "./subscription-status";

type OrganizationBillingSnapshot = {
  planId: string | null;
  subscriptionStatus: string | null;
};

export function resolveOrganizationPlan(
  organization: OrganizationBillingSnapshot | null | undefined,
): PlanId {
  if (!organization || !hasPlanAccess(organization.subscriptionStatus)) {
    return "free";
  }

  return organization.planId && isPlanId(organization.planId)
    ? organization.planId
    : "free";
}
