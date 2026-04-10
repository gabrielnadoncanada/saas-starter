"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import { Button } from "@/shared/components/ui/button";
import type {
  BillingInterval,
  PlanId,
  PricingModel,
} from "@/shared/config/billing.config";

type PriceSchedule = { unitAmount: number; trialDays?: number };

type PricePlan = {
  planId: PlanId;
  productName: string;
  description: string | null;
  features: string[];
  highlighted: boolean;
  pricingModel: PricingModel;
  monthly: PriceSchedule | null;
  yearly: PriceSchedule | null;
};

type PricingToggleProps = {
  plans: PricePlan[];
};

const recurringGridCols: Record<number, string> = {
  1: "max-w-md mx-auto",
  2: "max-w-3xl mx-auto md:grid-cols-2",
  3: "max-w-5xl mx-auto md:grid-cols-3",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function getIntervalLabel(
  interval: BillingInterval,
  pricingModel: PricingModel,
) {
  if (pricingModel === "per_seat") {
    return interval === "year" ? "per seat / year" : "per seat / month";
  }

  return interval === "year" ? "/ year" : "/ month";
}

function SubmitPricingButton({ label = "Get Started" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="w-full rounded-full"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

function PricingCard({
  interval,
  plan,
}: {
  interval: BillingInterval;
  plan: PricePlan;
}) {
  const schedule = interval === "year" ? plan.yearly : plan.monthly;

  if (!schedule) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-6 ${plan.highlighted ? "relative border-orange-500 ring-1 ring-orange-500 shadow-md" : "border-border"}`}
    >
      {plan.highlighted ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
          Most Popular
        </span>
      ) : null}
      <h2 className="mb-2 text-2xl font-medium text-foreground">
        {plan.productName}
      </h2>
      {plan.description ? (
        <p className="mb-2 text-sm text-muted-foreground">{plan.description}</p>
      ) : null}
      <p className="mb-4 text-sm text-muted-foreground">
        {schedule.trialDays
          ? `with ${schedule.trialDays} day free trial`
          : "\u00A0"}
      </p>
      <p className="mb-6 text-4xl font-medium text-foreground">
        {formatAmount(schedule.unitAmount)}
        <span className="text-xl font-normal text-muted-foreground">
          {getIntervalLabel(interval, plan.pricingModel)}
        </span>
      </p>
      <ul className="mb-8 space-y-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start">
            <Check className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={startSubscriptionCheckoutAction}>
        <input type="hidden" name="planId" value={plan.planId} />
        <input type="hidden" name="billingInterval" value={interval} />
        <SubmitPricingButton />
      </form>
    </div>
  );
}

export function PricingToggle({ plans }: PricingToggleProps) {
  const annualEnabled = plans.some((plan) => Boolean(plan.yearly));
  const [interval, setInterval] = useState<BillingInterval>("month");
  const visiblePlans = plans.filter((plan) =>
    interval === "year" ? Boolean(plan.yearly) : Boolean(plan.monthly),
  );
  const gridClass =
    recurringGridCols[Math.min(visiblePlans.length, 3)] ?? recurringGridCols[3];

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant={interval === "month" ? "default" : "outline"}
          onClick={() => setInterval("month")}
        >
          Monthly
        </Button>
        <Button
          type="button"
          variant={interval === "year" ? "default" : "outline"}
          onClick={() => setInterval("year")}
          disabled={!annualEnabled}
        >
          Yearly
        </Button>
      </div>

      <div className={`grid gap-8 ${gridClass}`}>
        {visiblePlans.map((plan) => (
          <PricingCard
            key={`${plan.planId}-${interval}`}
            interval={interval}
            plan={plan}
          />
        ))}
      </div>
    </div>
  );
}
