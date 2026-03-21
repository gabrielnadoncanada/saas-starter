import { getPricingPlans } from "@/features/billing/plans";
import { PricingToggle } from "@/features/billing/components/pricing-toggle";

export async function PricingSection() {
  const paidPlans = getPricingPlans()
    .flatMap((plan) => {
      const recurringEntry =
        plan.prices.monthly || plan.prices.yearly
          ? {
              productId: `${plan.id}-recurring`,
              productName: plan.name,
              description: plan.description,
              features: plan.marketingFeatures,
              pricingModel: plan.pricingModel,
              monthly: plan.prices.monthly ?? null,
              yearly: plan.prices.yearly ?? null,
              oneTime: null,
              sortAmount:
                plan.prices.monthly?.unitAmount ?? plan.prices.yearly?.unitAmount ?? 0,
            }
          : null;
      const oneTimeEntry = plan.prices.oneTime
        ? {
            productId: `${plan.id}-one-time`,
            productName: `${plan.name} Lifetime`,
            description: plan.description,
            features: plan.marketingFeatures,
            pricingModel: "one_time" as const,
            monthly: null,
            yearly: null,
            oneTime: plan.prices.oneTime,
            sortAmount: plan.prices.oneTime.unitAmount,
          }
        : null;

      return [recurringEntry, oneTimeEntry].filter(
        (entry): entry is NonNullable<typeof entry> => entry !== null,
      );
    })
    .sort((a, b) => a.sortAmount - b.sortAmount);

  const hasYearlyPrices = paidPlans.some((plan) => plan.yearly !== null);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PricingToggle plans={paidPlans} hasYearlyPrices={hasYearlyPrices} />
    </main>
  );
}
