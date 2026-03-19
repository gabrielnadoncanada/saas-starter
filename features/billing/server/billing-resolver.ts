import {
  getPlan,
  plans,
  type BillingInterval,
  type BillingPrice,
  type Plan,
  type PlanId,
  type PricingModel,
} from "@/features/billing/config/billing.config";

type ResolvedStripePrice = {
  interval: BillingInterval;
  planId: PlanId;
  pricingModel: PricingModel;
};

const DEFAULT_PLAN_ID: PlanId = "free";

function normalizeBillingInterval(
  interval: keyof Plan["prices"],
): BillingInterval {
  if (interval === "oneTime") {
    return "one_time";
  }

  return interval === "monthly" ? "month" : "year";
}

const configuredStripePrices = Object.values(plans).flatMap((plan) =>
  Object.entries(plan.prices)
    .filter((entry): entry is [keyof Plan["prices"], BillingPrice] => Boolean(entry[1]))
    .map(([interval, price]) => ({
      interval: normalizeBillingInterval(interval),
      priceId: price.priceId,
      planId: plan.id,
      pricingModel: interval === "oneTime" ? "one_time" : plan.pricingModel,
    })),
);

const stripePriceToPlan = configuredStripePrices.reduce<Record<string, ResolvedStripePrice>>(
  (accumulator, entry) => {
    accumulator[entry.priceId] = {
      interval: entry.interval,
      planId: entry.planId,
      pricingModel: entry.pricingModel,
    };

    return accumulator;
  },
  {},
);

export function getConfiguredStripePriceIds() {
  return configuredStripePrices.map((entry) => entry.priceId);
}

export function isConfiguredStripePriceId(priceId: string | null | undefined) {
  return Boolean(priceId && stripePriceToPlan[priceId]);
}

export function resolvePlanFromStripePriceId(
  priceId: string | null | undefined,
): PlanId {
  if (!priceId) {
    return DEFAULT_PLAN_ID;
  }

  return stripePriceToPlan[priceId]?.planId ?? DEFAULT_PLAN_ID;
}

export function resolvePricingModelFromStripePriceId(
  priceId: string | null | undefined,
): PricingModel {
  if (!priceId) {
    return "flat";
  }

  return stripePriceToPlan[priceId]?.pricingModel ?? "flat";
}

export function getPricingPlans() {
  return Object.values(plans).filter((plan) => plan.id !== "free");
}

export function getPlanDisplayName(planId: PlanId) {
  return getPlan(planId).name;
}
