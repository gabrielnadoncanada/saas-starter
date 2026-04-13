import "server-only";

import {
  getPlanDisplayPrice,
  getPricingPlans,
  hasOngoingSubscription,
} from "@/features/billing/plans";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { getCurrentOrganizationContext } from "@/features/organizations/server/organizations";

export async function getBillingPageData() {
  const [context, entitlements] = await Promise.all([
    getCurrentOrganizationContext(),
    getCurrentEntitlements(),
  ]);

  if (!context || !entitlements) {
    return null;
  }

  const hasSubscription = hasOngoingSubscription(
    entitlements.subscriptionStatus,
  );

  const plans = getPricingPlans().map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    monthly: getPlanDisplayPrice(plan.id, "month"),
    yearly: getPlanDisplayPrice(plan.id, "year"),
  }));

  return {
    context,
    entitlements,
    hasSubscription,
    plans,
  };
}
