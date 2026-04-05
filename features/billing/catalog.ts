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
  type PricingModel,
} from "@/shared/config/billing.config";

export type BillingPlanOption = {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  pricingModel: PricingModel;
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

const recurringPricesById = Object.fromEntries(
  recurringPrices.map((entry) => [entry.price.priceId, entry]),
) as unknown as Record<string, RecurringCatalogPrice>;

export function findCatalogRecurringPriceByPriceId(priceId: string) {
  return recurringPricesById[priceId] ?? null;
}

const plansById = Object.fromEntries(
  billingConfig.plans.map((plan) => [plan.id, plan]),
) as unknown as Record<PlanId, BillingPlan>;

const oneTimeProductsById = Object.fromEntries(
  billingConfig.oneTimeProducts.map((product) => [product.id, product]),
) as unknown as Record<string, OneTimeProductDefinition>;

const oneTimePricesById = Object.fromEntries(
  billingConfig.oneTimeProducts.flatMap((product) =>
    product.price ? [[product.price.priceId, product.id] as const] : [],
  ),
) as unknown as Record<string, string>;

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
  return Object.hasOwn(plansById, value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return plansById[planId] ?? plansById.free;
}

export function getOneTimeProduct(productId: string) {
  return oneTimeProductsById[productId] ?? null;
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

export function findOneTimeProductByPriceId(priceId: string) {
  const itemKey = oneTimePricesById[priceId];

  return itemKey ? getOneTimeProduct(itemKey) : null;
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
