import { Check } from 'lucide-react';

import { checkoutAction } from '@/features/billing/actions/checkout.action';
import { SubmitPricingButton } from '@/features/billing/components/SubmitPricingButton';
import {
  getStripePrices,
  getStripeProducts
} from '@/features/billing/server/stripe-catalog';

type PricingCardProps = {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
};

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId
}: PricingCardProps) {
  return (
    <div className="pt-6">
      <h2 className="mb-2 text-2xl font-medium text-foreground">{name}</h2>
      <p className="mb-4 text-sm text-muted-foreground">with {trialDays} day free trial</p>
      <p className="mb-6 text-4xl font-medium text-foreground">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-muted-foreground">per user / {interval}</span>
      </p>
      <ul className="mb-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitPricingButton />
      </form>
    </div>
  );
}

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
      const price = prices.find((p) => p.productId === product.id);
      if (!price) return null;

      return {
        product,
        price,
        unitAmount: price.unitAmount ?? 0,
      };
    })
    .filter((plan): plan is NonNullable<typeof plan> => plan !== null)
    .sort((a, b) => a.unitAmount - b.unitAmount);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className={`mx-auto grid max-w-xl gap-8 ${plans.length > 1 ? `md:grid-cols-${Math.min(plans.length, 3)}` : ''}`}>
        {plans.map((plan) => (
          <PricingCard
            key={plan.product.id}
            name={plan.product.name}
            price={plan.price.unitAmount ?? 0}
            interval={plan.price.interval ?? 'month'}
            trialDays={plan.price.trialPeriodDays ?? 7}
            features={parseFeatures(plan.product)}
            priceId={plan.price.id}
          />
        ))}
      </div>
    </main>
  );
}
