import { plans, type PlanId, type PricingModel } from "@/features/billing/plans";

type RecurringSelection = {
  planId: Exclude<PlanId, "free">;
  pricingModel: PricingModel;
  billingInterval: "month" | "year";
};

export function resolveRecurringSelectionFromPriceId(
  priceId: string,
): RecurringSelection | null {
  for (const plan of Object.values(plans)) {
    if (plan.id === "free") {
      continue;
    }

    if (plan.prices.monthly?.priceId === priceId) {
      return {
        planId: plan.id,
        pricingModel: plan.pricingModel,
        billingInterval: "month",
      };
    }

    if (plan.prices.yearly?.priceId === priceId) {
      return {
        planId: plan.id,
        pricingModel: plan.pricingModel,
        billingInterval: "year",
      };
    }
  }

  return null;
}

export function isConfiguredStripePriceId(priceId: string | null | undefined): boolean {
  return Boolean(priceId && resolveRecurringSelectionFromPriceId(priceId));
}
