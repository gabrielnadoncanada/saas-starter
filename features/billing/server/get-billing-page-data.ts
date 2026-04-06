import "server-only";

import {
  getPricingPlans,
  listOneTimeProducts,
  toBillingPlanOption,
} from "@/features/billing/catalog";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { hasCurrentStripeSubscription } from "@/features/billing/subscription-status";
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

  const plans = getPricingPlans().map(toBillingPlanOption);

  return {
    context,
    entitlements,
    hasSubscription,
    plans,
    oneTimeProducts: listOneTimeProducts(),
  };
}
