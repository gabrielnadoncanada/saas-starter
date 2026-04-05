import {
  billingConfig,
  type BillingInterval,
  type BillingPlanDefinition,
  type BillingPrice,
  type BillingRecurringLineItem,
} from "@/shared/config/billing.config";

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
