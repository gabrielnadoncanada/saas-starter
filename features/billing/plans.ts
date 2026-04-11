// Billing plans: catalog lookups, checkout helpers, and default entitlements.
//
// For capability/limit guards (hasCapability, assertCapability, assertLimit,
// UpgradeRequiredError, LimitReachedError) see ./plan-guards.
// For subscription-status helpers (hasPlanAccess, hasCurrentStripeSubscription)
// see ./subscription-status. Both are re-exported from this file so existing
// `@/features/billing/plans` imports keep working.
//
// HOW TO ADD A NEW PLAN:
//   1. Create a product + prices in Stripe Dashboard (monthly and/or yearly).
//   2. Add STRIPE_PRICE_<NAME>_MONTHLY / STRIPE_PRICE_<NAME>_YEARLY to .env.
//   3. Add a new entry in the `plans` array in shared/config/billing.config.ts.
//      Copy the "pro" block and change: id, name, description, features, capabilities, limits, price env vars.
//   4. Done — the pricing page, checkout, and entitlements will pick it up automatically.

import {
  billingConfig,
  type BillingInterval,
  type BillingPlan,
  type BillingPlanDefinition,
  type BillingPlanSchedule,
  type BillingPrice,
  type OneTimeProductDefinition,
  type OrganizationEntitlements,
  type PlanId,
} from "@/shared/config/billing.config";

export {
  assertCapability,
  assertLimit,
  checkLimit,
  getPlanLimit,
  hasCapability,
  LimitReachedError,
  UpgradeRequiredError,
} from "./plan-guards";
export {
  CURRENT_SUBSCRIPTION_STATUSES,
  hasCurrentStripeSubscription,
  hasPlanAccess,
  isTrialingSubscription,
} from "./subscription-status";

export type RecurringCatalogPrice = {
  billingInterval: BillingInterval;
  componentKey: string;
  itemKey: string;
  itemType: "plan";
  plan?: BillingPlanDefinition;
  price: BillingPrice;
};

export function findCatalogRecurringPriceByPriceId(priceId: string) {
  for (const plan of billingConfig.plans) {
    for (const [interval, schedule] of Object.entries(plan.schedules)) {
      for (const lineItem of schedule?.lineItems ?? []) {
        if (lineItem.price.priceId === priceId) {
          return {
            billingInterval: interval as BillingInterval,
            componentKey: lineItem.id,
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

function getPlanSchedule(
  plan: BillingPlan,
  billingInterval: BillingInterval,
): BillingPlanSchedule | undefined {
  const schedules = plan.schedules as Partial<
    Record<BillingInterval, BillingPlanSchedule | undefined>
  >;

  return schedules[billingInterval];
}

export function isPlanId(value: string): value is PlanId {
  return billingConfig.plans.some((plan) => plan.id === value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return (
    billingConfig.plans.find((p) => p.id === planId) ?? billingConfig.plans[0]
  );
}

export function getOneTimeProduct(productId: string) {
  return billingConfig.oneTimeProducts.find((p) => p.id === productId) ?? null;
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

export function getPlanDisplayPrice(
  planId: string,
  billingInterval: BillingInterval,
) {
  if (!isPlanId(planId)) {
    return null;
  }

  return (
    getPlanSchedule(getPlan(planId), billingInterval)?.lineItems[0]?.price ??
    null
  );
}

export function getPricingPlans(): BillingPlanDefinition[] {
  return billingConfig.plans.filter((plan) =>
    ["month", "year"].some((interval) =>
      Boolean(
        getPlanSchedule(plan, interval as BillingInterval)?.lineItems[0]?.price,
      ),
    ),
  ) as BillingPlanDefinition[];
}

export function listOneTimeProducts(): OneTimeProductDefinition[] {
  return billingConfig.oneTimeProducts.filter((product) =>
    Boolean(product.price),
  ) as OneTimeProductDefinition[];
}

export function buildPlanCheckoutLineItems(params: {
  billingInterval: BillingInterval;
  planId: PlanId;
  seatQuantity: number;
}) {
  return buildRecurringSelectionItems(params).map((item) => ({
    price: item.priceId,
    quantity: item.quantity,
  }));
}

export function buildRecurringSelectionItems(params: {
  billingInterval: BillingInterval;
  planId: PlanId;
  seatQuantity: number;
}) {
  const plan = getPlan(params.planId);
  const schedule = getPlanSchedule(plan, params.billingInterval);

  if (!schedule) {
    return [];
  }

  return schedule.lineItems.map((lineItem) => ({
    componentKey: lineItem.id,
    itemKey: plan.id,
    itemType: "plan" as const,
    priceId: lineItem.price.priceId,
    quantity:
      lineItem.kind === "seat"
        ? Math.max(1, params.seatQuantity - (lineItem.includedQuantity ?? 0))
        : 1,
  }));
}

export type SubscriptionFormSelection = {
  planId: PlanId;
  billingInterval: BillingInterval;
  seatQuantity: number | null;
};

export function parseSubscriptionForm(
  formData: FormData,
): SubscriptionFormSelection {
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const rawSeatQuantity = formData.get("seatQuantity");

  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;
  const seatQuantity =
    typeof rawSeatQuantity === "string" ? Number(rawSeatQuantity) : NaN;

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
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : null,
  };
}

export function getDefaultEntitlements(params: {
  organizationId: string;
}): OrganizationEntitlements {
  const plan = getPlan("free");

  return {
    billingInterval: null,
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    oneTimeProductIds: [],
    organizationId: params.organizationId,
    planId: "free",
    planName: plan.name,
    pricingModel: plan.pricingModel,
    seats: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    trialEnd: null,
  };
}
