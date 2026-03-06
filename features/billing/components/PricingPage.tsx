import { Check } from 'lucide-react';

import { checkoutAction } from '@/features/billing/actions/checkout.action';
import { SubmitPricingButton } from '@/features/billing/components/SubmitPricingButton';
import {
  getStripePrices,
  getStripeProducts
} from '@/features/billing/lib/stripe-billing';

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
      <h2 className="mb-2 text-2xl font-medium text-gray-900">{name}</h2>
      <p className="mb-4 text-sm text-gray-600">with {trialDays} day free trial</p>
      <p className="mb-6 text-4xl font-medium text-gray-900">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">per user / {interval}</span>
      </p>
      <ul className="mb-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <span className="text-gray-700">{feature}</span>
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

export async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts()
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');
  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-8 md:grid-cols-2">
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support'
          ]}
          priceId={basePrice?.id}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access'
          ]}
          priceId={plusPrice?.id}
        />
      </div>
    </main>
  );
}
