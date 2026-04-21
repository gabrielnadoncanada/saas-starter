// HOW TO ADD A NEW PLAN:
//   1. Create a product + prices in Stripe Dashboard (monthly and/or yearly).
//   2. Add STRIPE_PRICE_<NAME>_MONTHLY / STRIPE_PRICE_<NAME>_YEARLY to .env.
//   3. Add a new entry in the `plans` array in config/billing.config.ts.
//      Copy the "pro" block and change: id, name, description, features, capabilities, limits, price env vars.
//   4. Done — the pricing page, checkout, and entitlements will pick it up automatically.

import {
  billingConfig,
  type BillingInterval,
  type BillingIntervalPricing,
  type BillingPlan,
  type BillingPrice,
  type PlanId,
} from "@/config/billing.config";

export const SUBSCRIPTION_EXISTS_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
  "unpaid",
  "paused",
] as const;

export const PLAN_ACCESS_STATUSES = ["active", "trialing"] as const;
const PLAN_ACCESS_STATUS_SET = new Set<string>(PLAN_ACCESS_STATUSES);

const ONGOING_SUBSCRIPTION_STATUSES = new Set<string>(
  SUBSCRIPTION_EXISTS_STATUSES,
);

export function hasPlanAccess(subscriptionStatus: string | null | undefined) {
  return Boolean(subscriptionStatus && PLAN_ACCESS_STATUS_SET.has(subscriptionStatus));
}

export function hasOngoingSubscription(
  subscriptionStatus: string | null | undefined,
) {
  return Boolean(
    subscriptionStatus && ONGOING_SUBSCRIPTION_STATUSES.has(subscriptionStatus),
  );
}

export function isTrialingSubscription(
  subscriptionStatus: string | null | undefined,
) {
  return subscriptionStatus === "trialing";
}

export type CatalogPriceMatch = {
  billingInterval: BillingInterval;
  componentKey: string;
  itemKey: string;
  itemType: "plan";
  plan: BillingPlan;
  price: BillingPrice;
};

export function findCatalogPrice(priceId: string): CatalogPriceMatch | null {
  for (const plan of billingConfig.plans) {
    for (const [interval, pricing] of Object.entries(plan.intervalPricing)) {
      for (const lineItem of pricing?.lineItems ?? []) {
        if (lineItem.price.priceId === priceId) {
          return {
            billingInterval: interval as BillingInterval,
            componentKey: lineItem.component,
            itemKey: plan.id,
            itemType: "plan",
            plan,
            price: lineItem.price,
          };
        }
      }
    }
  }
  return null;
}

function getIntervalPricing(
  plan: BillingPlan,
  billingInterval: BillingInterval,
): BillingIntervalPricing | undefined {
  const pricing = plan.intervalPricing as Partial<
    Record<BillingInterval, BillingIntervalPricing | undefined>
  >;

  return pricing[billingInterval];
}

export function isPlanId(value: string): value is PlanId {
  return billingConfig.plans.some((plan) => plan.id === value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return (
    billingConfig.plans.find((p) => p.id === planId) ?? billingConfig.plans[0]
  );
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

export function normalizeBillingInterval(
  value: string | null | undefined,
): BillingInterval | null {
  return value && isBillingInterval(value) ? value : null;
}

export function hasAnnualPlans(
  plans: readonly { yearly?: unknown | null }[],
): boolean {
  return plans.some((plan) => plan.yearly != null);
}

export function getPlanDisplayPrice(
  planId: string,
  billingInterval: BillingInterval,
) {
  if (!isPlanId(planId)) {
    return null;
  }

  return (
    getIntervalPricing(getPlan(planId), billingInterval)?.lineItems[0]?.price ??
    null
  );
}

const BILLING_INTERVALS: readonly BillingInterval[] = ["month", "year"];

export function getPricingPlans(): BillingPlan[] {
  return billingConfig.plans.filter((plan) =>
    BILLING_INTERVALS.some(
      (interval) =>
        getIntervalPricing(plan, interval)?.lineItems[0]?.price !== undefined,
    ),
  );
}

export function buildPlanCheckoutLineItems(params: {
  billingInterval: BillingInterval;
  planId: PlanId;
}) {
  const plan = getPlan(params.planId);
  const pricing = getIntervalPricing(plan, params.billingInterval);

  if (!pricing) {
    return [];
  }

  return pricing.lineItems.map((lineItem) => ({
    price: lineItem.price.priceId,
    quantity: 1,
  }));
}

