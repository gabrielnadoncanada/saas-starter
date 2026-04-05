import "server-only";

import {
  type BillingPlanOption,
  getPlanDisplayPrice,
  getPricingPlans,
  listOneTimeProducts,
} from "@/features/billing/catalog";
import { hasCurrentStripeSubscription } from "@/features/billing/subscription-status";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import type { PlanId } from "@/shared/config/billing.config";

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

  const plans: BillingPlanOption[] = getPricingPlans().map((plan) => ({
    id: plan.id as PlanId,
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
