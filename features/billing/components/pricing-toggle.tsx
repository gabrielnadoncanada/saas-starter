'use client';

import { useState } from 'react';
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
  yearly: { priceId: string; unitAmount: number; trialDays?: number } | null;
  oneTime: { priceId: string; unitAmount: number } | null;
};

type PricingToggleProps = {
  plans: PricePlan[];
  hasYearlyPrices: boolean;
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
  const isOneTime = pricingModel === 'one_time';
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
        <p className="mb-4 text-sm text-muted-foreground">
          {isOneTime ? 'one-time payment' : '\u00A0'}
        </p>
      )}
      <p className="mb-6 text-4xl font-medium text-foreground">
        ${price / 100}{' '}
        {!isOneTime && interval && (
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
        <input type="hidden" name="pricingModel" value={pricingModel} />
        <SubmitPricingButton label={isOneTime ? 'Buy Now' : undefined} />
      </form>
    </div>
  );
}

export function PricingToggle({ plans, hasYearlyPrices }: PricingToggleProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(
    'month',
  );

  const recurringPlans = plans.filter((p) => p.pricingModel !== 'one_time');
  const oneTimePlans = plans.filter((p) => p.pricingModel === 'one_time');

  const gridClass =
    recurringGridCols[Math.min(recurringPlans.length, 3)] ?? recurringGridCols[3];

  const oneTimeGridClass =
    recurringGridCols[Math.min(oneTimePlans.length, 3)] ?? recurringGridCols[3];

  // Feature the second plan when there are 2+ recurring plans (typical: cheapest, then recommended)
  const featuredIndex = recurringPlans.length >= 2 ? 1 : -1;

  return (
    <>
      {hasYearlyPrices && recurringPlans.length > 0 && (
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
            onClick={() =>
              setBillingInterval((prev) =>
                prev === 'month' ? 'year' : 'month',
              )
            }
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

      <div className={`grid gap-8 ${gridClass}`}>
        {recurringPlans.map((plan, index) => {
          const activePrice =
            billingInterval === 'year' && plan.yearly
              ? plan.yearly
              : plan.monthly;

          if (!activePrice) return null;

          return (
            <PricingCard
              key={plan.productId}
              name={plan.productName}
              price={activePrice.unitAmount}
              interval={
                billingInterval === 'year' && plan.yearly ? 'year' : 'month'
              }
              trialDays={activePrice.trialDays ?? null}
              features={plan.features}
              priceId={activePrice.priceId}
              pricingModel={plan.pricingModel}
              featured={index === featuredIndex}
            />
          );
        })}
      </div>

      {oneTimePlans.length > 0 && (
        <div className={`mt-12 grid gap-8 ${oneTimeGridClass}`}>
          {oneTimePlans.map((plan) => {
            if (!plan.oneTime) return null;

            return (
              <PricingCard
                key={plan.productId}
                name={plan.productName}
                price={plan.oneTime.unitAmount}
                interval={null}
                trialDays={null}
                features={plan.features}
                priceId={plan.oneTime.priceId}
                pricingModel={plan.pricingModel}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
