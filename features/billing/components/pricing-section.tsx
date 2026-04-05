import {
  getPlanDisplayPrice,
  getPricingPlans,
} from "@/features/billing/catalog/resolver";
import { PricingToggle } from "@/features/billing/components/pricing-toggle";
import type { PlanId } from "@/shared/config/billing.config";

export async function PricingSection() {
  const paidPlans = getPricingPlans()
    .map((plan) => ({
      planId: plan.id as PlanId,
      productName: plan.name,
      description: plan.description,
      highlighted: plan.highlighted ?? false,
      features: plan.features,
      pricingModel: plan.pricingModel,
      monthly: getPlanDisplayPrice(plan.id, "month"),
      yearly: getPlanDisplayPrice(plan.id, "year"),
      sortAmount: getPlanDisplayPrice(plan.id, "month")?.unitAmount ?? 0,
    }))
    .filter((plan) => plan.monthly !== null)
    .sort((a, b) => a.sortAmount - b.sortAmount);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PricingToggle plans={paidPlans} />
    </main>
  );
}
