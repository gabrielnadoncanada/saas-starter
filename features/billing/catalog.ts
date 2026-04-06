// Billing catalog: resolves billing.config.ts definitions into lookups and checkout helpers.
//
// Mental model:
//   Plan (free/pro/team) → Schedule (month/year) → Line Items → Prices
//   One-time products (storage boost, etc.) have a single price each.
//
// Main entry points:
//   getPricingPlans()              → plans with at least one configured price
//   buildPlanCheckoutLineItems()   → Stripe-ready line items for checkout
//   parseSubscriptionForm()        → validate + extract plan selection from FormData
//   getDefaultEntitlements()       → free-plan entitlements for new orgs

import {
  billingConfig,
  type BillingInterval,
  type BillingPlan,
  type BillingPlanDefinition,
  type BillingPlanSchedule,
  type BillingPrice,
  type BillingRecurringLineItem,
  type OneTimeProductDefinition,
  type OrganizationEntitlements,
  type PlanId,
} from "@/shared/config/billing.config";

export type BillingPlanOption = Pick<
  BillingPlanDefinition,
  "name" | "description" | "features" | "pricingModel"
> & {
  id: PlanId;
  monthly: BillingPrice | null;
  yearly: BillingPrice | null;
};

export type RecurringCatalogPrice = {
  billingInterval: BillingInterval;
  componentKey: string;
  itemKey: string;
  itemType: "plan";
  plan?: BillingPlanDefinition;
  price: BillingPrice;
};

const recurringPrices = billingConfig.plans.flatMap((plan) =>
  Object.entries(plan.schedules).flatMap(([billingInterval, schedule]) =>
    (schedule?.lineItems ?? []).map(
      (lineItem: BillingRecurringLineItem): RecurringCatalogPrice => ({
        billingInterval: billingInterval as BillingInterval,
        componentKey: lineItem.id,
        itemKey: plan.id,
        itemType: "plan",
        plan,
        price: lineItem.price,
      }),
    ),
  ),
);

const recurringPricesById = new Map<string, RecurringCatalogPrice>(
  recurringPrices.map((entry) => [entry.price.priceId, entry]),
);

export function findCatalogRecurringPriceByPriceId(priceId: string) {
  return recurringPricesById.get(priceId) ?? null;
}

const plansById = new Map<string, BillingPlan>(
  billingConfig.plans.map((plan) => [plan.id, plan]),
);

const oneTimeProductsById = new Map<string, OneTimeProductDefinition>(
  billingConfig.oneTimeProducts.map((product) => [product.id, product]),
);

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
  return plansById.has(value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return plansById.get(planId) ?? plansById.get("free")!;
}

export function getOneTimeProduct(productId: string) {
  return oneTimeProductsById.get(productId) ?? null;
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

export function toBillingPlanOption(plan: BillingPlanDefinition): BillingPlanOption {
  return {
    id: plan.id as PlanId,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    pricingModel: plan.pricingModel,
    monthly: getPlanDisplayPrice(plan.id, "month"),
    yearly: getPlanDisplayPrice(plan.id, "year"),
  };
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
  };
}
