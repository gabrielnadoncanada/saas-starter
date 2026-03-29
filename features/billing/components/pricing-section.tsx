import { getPricingPlans } from "@/features/billing/plans";
import { PricingToggle } from "@/features/billing/components/pricing-toggle";

export async function PricingSection() {
  const paidPlans = getPricingPlans()
    .map((plan) => ({
      productId: `${plan.id}-recurring`,
      productName: plan.name,
      description: plan.description,
      features: plan.features,
      pricingModel: plan.pricingModel,
      monthly: plan.prices.monthly ?? null,
      sortAmount: plan.prices.monthly?.unitAmount ?? 0,
    }))
    .filter((plan) => plan.monthly !== null)
    .sort((a, b) => a.sortAmount - b.sortAmount);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PricingToggle plans={paidPlans} />
    </main>
  );
}
