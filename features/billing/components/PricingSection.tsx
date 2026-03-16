import {
  getStripePrices,
  getStripeProducts
} from '@/features/billing/server/stripe-catalog';
import { PricingToggle } from '@/features/billing/components/PricingToggle';

function parseFeatures(product: {
  metadata: Record<string, string>;
  description: string | null;
}): string[] {
  if (product.metadata.features) {
    return product.metadata.features.split(',').map((f) => f.trim());
  }

  if (product.description) {
    return [product.description];
  }

  return [];
}

export async function PricingSection() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts()
  ]);

  const plans = products
    .map((product) => {
      const monthlyPrice = prices.find(
        (p) => p.productId === product.id && p.interval === 'month'
      );
      const yearlyPrice = prices.find(
        (p) => p.productId === product.id && p.interval === 'year'
      );

      if (!monthlyPrice && !yearlyPrice) return null;

      return {
        productId: product.id,
        productName: product.name,
        description: product.description,
        features: parseFeatures(product),
        monthly: monthlyPrice
          ? {
              priceId: monthlyPrice.id,
              unitAmount: monthlyPrice.unitAmount ?? 0,
              trialDays: monthlyPrice.trialPeriodDays ?? 7,
            }
          : null,
        yearly: yearlyPrice
          ? {
              priceId: yearlyPrice.id,
              unitAmount: yearlyPrice.unitAmount ?? 0,
              trialDays: yearlyPrice.trialPeriodDays ?? 7,
            }
          : null,
        sortAmount: monthlyPrice?.unitAmount ?? yearlyPrice?.unitAmount ?? 0,
      };
    })
    .filter((plan): plan is NonNullable<typeof plan> => plan !== null)
    .sort((a, b) => a.sortAmount - b.sortAmount);

  const hasYearlyPrices = plans.some((plan) => plan.yearly !== null);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PricingToggle plans={plans} hasYearlyPrices={hasYearlyPrices} />
    </main>
  );
}
