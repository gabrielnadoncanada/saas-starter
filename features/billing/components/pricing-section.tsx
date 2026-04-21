import type { PlanId } from "@/config/billing.config";
import { PricingToggle } from "@/features/billing/components/pricing-toggle";
import {
  getPlanDisplayPrice,
  getPricingPlans,
} from "@/features/billing/plans";
import type { PricingPlanView } from "@/features/billing/types";

export async function PricingSection() {
  const paidPlans: PricingPlanView[] = getPricingPlans()
    .map((plan) => ({
      id: plan.id as PlanId,
      name: plan.name,
      description: plan.description,
      highlighted: plan.highlighted ?? false,
      features: plan.features,
      monthly: getPlanDisplayPrice(plan.id, "month"),
      yearly: getPlanDisplayPrice(plan.id, "year"),
    }))
    .filter((plan) => plan.monthly !== null)
    .sort((a, b) => (a.monthly?.unitAmount ?? 0) - (b.monthly?.unitAmount ?? 0));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PricingToggle plans={paidPlans} />
    </main>
  );
}
