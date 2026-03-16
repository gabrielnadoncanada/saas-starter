'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { checkoutAction } from '@/features/billing/actions/checkout.action';
import { SubmitPricingButton } from '@/features/billing/components/SubmitPricingButton';

type PricePlan = {
  productId: string;
  productName: string;
  description: string | null;
  features: string[];
  monthly: { priceId: string; unitAmount: number; trialDays: number } | null;
  yearly: { priceId: string; unitAmount: number; trialDays: number } | null;
};

type PricingToggleProps = {
  plans: PricePlan[];
  hasYearlyPrices: boolean;
};

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId: string;
}) {
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

export function PricingToggle({ plans, hasYearlyPrices }: PricingToggleProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  return (
    <>
      {hasYearlyPrices && (
        <div className="mb-8 flex items-center justify-center gap-4">
          <span
            className={`text-sm font-medium ${billingInterval === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billingInterval === 'year'}
            onClick={() => setBillingInterval((prev) => (prev === 'month' ? 'year' : 'month'))}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-orange-500"
            data-state={billingInterval === 'year' ? 'checked' : 'unchecked'}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${billingInterval === 'year' ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span
            className={`text-sm font-medium ${billingInterval === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Yearly
          </span>
        </div>
      )}

      <div
        className={`mx-auto grid max-w-xl gap-8 ${plans.length > 1 ? `md:grid-cols-${Math.min(plans.length, 3)}` : ''}`}
      >
        {plans.map((plan) => {
          const activePrice =
            billingInterval === 'year' && plan.yearly ? plan.yearly : plan.monthly;

          if (!activePrice) return null;

          return (
            <PricingCard
              key={plan.productId}
              name={plan.productName}
              price={activePrice.unitAmount}
              interval={billingInterval === 'year' && plan.yearly ? 'year' : 'month'}
              trialDays={activePrice.trialDays}
              features={plan.features}
              priceId={activePrice.priceId}
            />
          );
        })}
      </div>
    </>
  );
}
