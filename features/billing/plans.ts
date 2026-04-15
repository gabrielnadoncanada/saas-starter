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

const PLAN_ACCESS_STATUSES = new Set(["active", "trialing"]);

export function hasPlanAccess(subscriptionStatus: string | null | undefined) {
  if (!subscriptionStatus) {
    return false;
  }

  return PLAN_ACCESS_STATUSES.has(subscriptionStatus);
}

export function hasOngoingSubscription(
  subscriptionStatus: string | null | undefined,
) {
  if (!subscriptionStatus) {
    return false;
  }

  return SUBSCRIPTION_EXISTS_STATUSES.includes(
    subscriptionStatus as (typeof SUBSCRIPTION_EXISTS_STATUSES)[number],
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
  plan?: BillingPlan;
  price: BillingPrice;
};

export function findCatalogPrice(priceId: string) {
  for (const plan of billingConfig.plans) {
    for (const [interval, pricing] of Object.entries(plan.intervalPricing)) {
      for (const lineItem of pricing?.lineItems ?? []) {
        if (lineItem.price.priceId === priceId) {
          return {
            billingInterval: interval as BillingInterval,
            componentKey: lineItem.component,
            itemKey: plan.id,
            itemType: "plan" as const,
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
  plans: readonly { yearly?: unknown }[],
): boolean {
  return plans.some((plan) => Boolean(plan.yearly));
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

export function getPricingPlans(): BillingPlan[] {
  return billingConfig.plans.filter((plan) =>
    ["month", "year"].some((interval) =>
      Boolean(
        getIntervalPricing(plan, interval as BillingInterval)?.lineItems[0]?.price,
      ),
    ),
  ) as BillingPlan[];
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

export type SubscriptionFormSelection = {
  planId: PlanId;
  billingInterval: BillingInterval;
};

export function parseSubscriptionForm(
  formData: FormData,
): SubscriptionFormSelection {
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");

  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;

  if (
    !planId ||
    !isPlanId(planId) ||
    planId === "free" ||
    !billingInterval ||
    !isBillingInterval(billingInterval) ||
    !getPlanDisplayPrice(planId, billingInterval)
  ) {
    throw new Error("Invalid billing selection.");
  }

  return {
    planId,
    billingInterval,
  };
}
