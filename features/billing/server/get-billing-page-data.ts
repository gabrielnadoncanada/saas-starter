import "server-only";

import {
  getPlanDisplayPrice,
  getPricingPlans,
  hasCurrentStripeSubscription,
  listOneTimeProducts,
} from "@/features/billing/plans";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { getCurrentOrganizationContext } from "@/features/organizations/server/organizations";

export async function getBillingPageData() {
  const [context, entitlements] = await Promise.all([
    getCurrentOrganizationContext(),
    getCurrentOrganizationEntitlements(),
  ]);

  if (!context || !entitlements) {
    return null;
  }

  const hasSubscription = hasCurrentStripeSubscription(
    entitlements.subscriptionStatus,
  );

  const plans = getPricingPlans().map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    pricingModel: plan.pricingModel,
    monthly: getPlanDisplayPrice(plan.id, "month"),
    yearly: getPlanDisplayPrice(plan.id, "year"),
  }));

  return {
    context,
    entitlements,
    hasSubscription,
    plans,
    oneTimeProducts: listOneTimeProducts(),
  };
}
