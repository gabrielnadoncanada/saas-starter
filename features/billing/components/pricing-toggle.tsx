'use client';

import { Check } from 'lucide-react';

import type { PricingModel } from '@/features/billing/plans';
import { checkoutAction } from '@/features/billing/actions/checkout.action';
import { SubmitPricingButton } from '@/features/billing/components/submit-pricing-button';

type PricePlan = {
  productId: string;
  productName: string;
  description: string | null;
  features: string[];
  pricingModel: PricingModel;
  monthly: { priceId: string; unitAmount: number; trialDays?: number } | null;
};

type PricingToggleProps = {
  plans: PricePlan[];
};

const recurringGridCols: Record<number, string> = {
  1: 'max-w-md mx-auto',
  2: 'max-w-3xl mx-auto md:grid-cols-2',
  3: 'max-w-5xl mx-auto md:grid-cols-3',
};

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  pricingModel,
  featured,
}: {
  name: string;
  price: number;
  interval: string | null;
  trialDays: number | null;
  features: string[];
  priceId: string;
  pricingModel: PricingModel;
  featured?: boolean;
}) {
  const isPerSeat = pricingModel === 'per_seat';

  const intervalLabel = isPerSeat
    ? `per seat / ${interval}`
    : `/ ${interval}`;

  return (
    <div
      className={`rounded-lg border p-6 ${featured ? 'border-orange-500 ring-1 ring-orange-500 shadow-md relative' : 'border-border'}`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}
      <h2 className="mb-2 text-2xl font-medium text-foreground">{name}</h2>
      {trialDays ? (
        <p className="mb-4 text-sm text-muted-foreground">
          with {trialDays} day free trial
        </p>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">{'\u00A0'}</p>
      )}
      <p className="mb-6 text-4xl font-medium text-foreground">
        ${price / 100}{' '}
        {interval && (
          <span className="text-xl font-normal text-muted-foreground">
            {intervalLabel}
          </span>
        )}
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

export function PricingToggle({ plans }: PricingToggleProps) {
  const gridClass =
    recurringGridCols[Math.min(plans.length, 3)] ?? recurringGridCols[3];

  const featuredIndex = plans.length >= 2 ? 1 : -1;

  return (
    <div className={`grid gap-8 ${gridClass}`}>
      {plans.map((plan, index) => {
        if (!plan.monthly) return null;

        return (
          <PricingCard
            key={plan.productId}
            name={plan.productName}
            price={plan.monthly.unitAmount}
            interval="month"
            trialDays={plan.monthly.trialDays ?? null}
            features={plan.features}
            priceId={plan.monthly.priceId}
            pricingModel={plan.pricingModel}
            featured={index === featuredIndex}
          />
        );
      })}
    </div>
  );
}
