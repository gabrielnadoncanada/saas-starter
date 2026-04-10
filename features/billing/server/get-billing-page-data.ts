import "server-only";

import {
  getPlanDisplayPrice,
  getPricingPlans,
  listOneTimeProducts,
} from "@/features/billing/catalog";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { hasCurrentStripeSubscription } from "@/features/billing/plan-guards";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";

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
