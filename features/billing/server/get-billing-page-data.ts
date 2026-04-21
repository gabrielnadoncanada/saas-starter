import "server-only";

import type { PlanId } from "@/config/billing.config";
import {
  getPlanDisplayPrice,
  getPricingPlans,
  hasOngoingSubscription,
} from "@/features/billing/plans";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import type { PricingPlanView } from "@/features/billing/types";
import { getCurrentOrganizationContext } from "@/features/organizations/server/organizations";

export async function getBillingPageData() {
  const [context, entitlements] = await Promise.all([
    getCurrentOrganizationContext(),
    getCurrentEntitlements(),
  ]);

  if (!context || !entitlements) {
    return null;
  }

  const plans: PricingPlanView[] = getPricingPlans().map((plan) => ({
    id: plan.id as PlanId,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    highlighted: plan.highlighted ?? false,
    monthly: getPlanDisplayPrice(plan.id, "month"),
    yearly: getPlanDisplayPrice(plan.id, "year"),
  }));

  return {
    context,
    entitlements,
    hasSubscription: hasOngoingSubscription(entitlements.subscriptionStatus),
    plans,
  };
}
