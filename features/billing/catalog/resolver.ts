import {
  type BillingAddonDefinition,
  billingConfig,
  type BillingInterval,
  type BillingPlan,
  type BillingPlanDefinition,
  type BillingPlanSchedule,
  type BillingPrice,
  type BillingRecurringLineItem,
  type Capability,
  type CreditPackDefinition,
  type LimitKey,
  type OneTimeProductDefinition,
  type OrganizationEntitlements,
  type PlanId,
} from "@/shared/config/billing.config";

const plansById = Object.fromEntries(
  billingConfig.plans.map((plan) => [plan.id, plan]),
) as unknown as Record<PlanId, BillingPlan>;

const addonsById = Object.fromEntries(
  billingConfig.addons.map((addon) => [addon.id, addon]),
) as unknown as Record<string, BillingAddonDefinition>;

const oneTimeProductsById = Object.fromEntries(
  billingConfig.oneTimeProducts.map((product) => [product.id, product]),
) as unknown as Record<string, OneTimeProductDefinition>;

const creditPacksById = Object.fromEntries(
  billingConfig.creditPacks.map((creditPack) => [creditPack.id, creditPack]),
) as unknown as Record<string, CreditPackDefinition>;

const oneTimePricesById = Object.fromEntries(
  [
    ...billingConfig.oneTimeProducts.flatMap((product) =>
      product.price ? [[product.price.priceId, product.id] as const] : [],
    ),
    ...billingConfig.creditPacks.flatMap((creditPack) =>
      creditPack.price ? [[creditPack.price.priceId, creditPack.id] as const] : [],
    ),
  ],
) as unknown as Record<string, string>;

type RecurringCatalogPrice = {
  billingInterval: BillingInterval;
  componentKey: string;
  itemKey: string;
  itemType: "plan" | "addon";
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

const addonRecurringPrices = billingConfig.addons.flatMap((addon) =>
  Object.entries(addon.prices).flatMap(([billingInterval, price]) =>
    price
      ? [
          {
            billingInterval: billingInterval as BillingInterval,
            componentKey: "default",
            itemKey: addon.id,
            itemType: "addon" as const,
            price,
          },
        ]
      : [],
  ),
);

const recurringPricesById = Object.fromEntries(
  [...recurringPrices, ...addonRecurringPrices].map((entry) => [
    entry.price.priceId,
    entry,
  ]),
) as unknown as Record<string, RecurringCatalogPrice>;

function addLimitDelta(
  limits: Record<LimitKey, number>,
  delta: Partial<Record<LimitKey, number>>,
) {
  for (const limitKey of Object.keys(delta) as LimitKey[]) {
    limits[limitKey] += delta[limitKey] ?? 0;
  }
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
  return Object.hasOwn(plansById, value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return plansById[planId] ?? plansById.free;
}

export function getAddon(addonId: string) {
  return addonsById[addonId] ?? null;
}

export function getOneTimeProduct(productId: string) {
  return oneTimeProductsById[productId] ?? null;
}

export function getCreditPack(creditPackId: string) {
  return creditPacksById[creditPackId] ?? null;
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

  return getPlanSchedule(getPlan(planId), billingInterval)?.lineItems[0]?.price ?? null;
}

export function getPricingPlans(): BillingPlanDefinition[] {
  return billingConfig.plans.filter((plan) =>
    ["month", "year"].some((interval) =>
      Boolean(getPlanSchedule(plan, interval as BillingInterval)?.lineItems[0]?.price),
    ),
  ) as BillingPlanDefinition[];
}

export function listRecurringAddons(): BillingAddonDefinition[] {
  return billingConfig.addons.filter(
    (addon) => Boolean(addon.prices.month) || Boolean(addon.prices.year),
  ) as BillingAddonDefinition[];
}

export function listOneTimeProducts(): OneTimeProductDefinition[] {
  return billingConfig.oneTimeProducts.filter((product) =>
    Boolean(product.price),
  ) as OneTimeProductDefinition[];
}

export function listCreditPacks(): CreditPackDefinition[] {
  return billingConfig.creditPacks.filter((creditPack) =>
    Boolean(creditPack.price),
  ) as CreditPackDefinition[];
}

export function findCatalogRecurringPriceByPriceId(priceId: string) {
  return recurringPricesById[priceId] ?? null;
}

export function findOneTimeProductByPriceId(priceId: string) {
  const itemKey = oneTimePricesById[priceId];

  return itemKey ? getOneTimeProduct(itemKey) : null;
}

export function findCreditPackByPriceId(priceId: string) {
  const itemKey = oneTimePricesById[priceId];

  return itemKey ? getCreditPack(itemKey) : null;
}

export function buildPlanCheckoutLineItems(params: {
  addonIds: string[];
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
  addonIds: string[];
  billingInterval: BillingInterval;
  planId: PlanId;
  seatQuantity: number;
}) {
  const plan = getPlan(params.planId);
  const schedule = getPlanSchedule(plan, params.billingInterval);

  if (!schedule) {
    return [];
  }

  const planItems = schedule.lineItems.map((lineItem) => ({
    componentKey: lineItem.id,
    itemKey: plan.id,
    itemType: "plan" as const,
    priceId: lineItem.price.priceId,
    quantity:
      lineItem.kind === "seat"
        ? Math.max(1, params.seatQuantity - (lineItem.includedQuantity ?? 0))
        : 1,
  }));

  const addonItems = params.addonIds.flatMap((addonId) => {
    const addon = getAddon(addonId);
    const price = addon?.prices[params.billingInterval];

    return price
      ? [
          {
            componentKey: "default",
            itemKey: addonId,
            itemType: "addon" as const,
            priceId: price.priceId,
            quantity: 1,
          },
        ]
      : [];
  });

  return [...planItems, ...addonItems];
}

export function getDefaultEntitlements(params: {
  organizationId: string;
  creditBalance: number;
  creditBalancePurchased: number;
  creditBalanceSubscription: number;
}): OrganizationEntitlements {
  const plan = getPlan("free");

  return {
    activeAddonIds: [],
    billingInterval: null,
    capabilities: [...plan.capabilities],
    creditBalance: params.creditBalance,
    creditBalancePurchased: params.creditBalancePurchased,
    creditBalanceSubscription: params.creditBalanceSubscription,
    includedMonthlyCredits: plan.includedMonthlyCredits,
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

export function applyEntitlementDeltas(
  entitlements: OrganizationEntitlements,
  input: {
    activeAddonIds: string[];
    oneTimeProductIds: string[];
  },
) {
  const capabilities = new Set<Capability>(entitlements.capabilities);
  const limits = { ...entitlements.limits };
  let includedMonthlyCredits = entitlements.includedMonthlyCredits;

  for (const addonId of input.activeAddonIds) {
    const addon = getAddon(addonId);
    if (!addon) continue;
    addon.capabilityDeltas.forEach((capability) => capabilities.add(capability));
    addLimitDelta(limits, addon.limitDeltas);
    includedMonthlyCredits += addon.includedMonthlyCredits ?? 0;
  }

  for (const productId of input.oneTimeProductIds) {
    const product = getOneTimeProduct(productId);
    if (!product) continue;
    product.capabilityDeltas.forEach((capability) => capabilities.add(capability));
    addLimitDelta(limits, product.limitDeltas);
  }

  return {
    ...entitlements,
    activeAddonIds: [...input.activeAddonIds],
    capabilities: [...capabilities],
    includedMonthlyCredits,
    limits,
    oneTimeProductIds: [...input.oneTimeProductIds],
  };
}
