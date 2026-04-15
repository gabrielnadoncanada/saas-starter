"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import type { BillingInterval, PlanId } from "@/config/billing.config";
import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import {
  formatPriceAmount,
  getBillingIntervalSuffix,
} from "@/features/billing/format-price";
import { hasAnnualPlans } from "@/features/billing/plans";
import { cn } from "@/lib/utils";

type PriceSchedule = { unitAmount: number; trialDays?: number };

type PricePlan = {
  planId: PlanId;
  productName: string;
  description: string | null;
  features: string[];
  highlighted: boolean;
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

function SubmitPricingButton({
  highlighted = false,
}: {
  highlighted?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50",
        highlighted
          ? "bg-brand text-brand-foreground hover:bg-brand/90"
          : "border border-border text-foreground hover:border-foreground",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Get started
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </>
      )}
    </button>
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

  const isBrand = plan.highlighted;

  return (
    <div className="relative flex flex-col border border-border bg-card p-8">
      {isBrand ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-brand"
        />
      ) : null}

      <div className="mb-6 flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "size-1.5",
            isBrand ? "bg-brand" : "bg-muted-foreground/40",
          )}
        />
        <span
          className={cn("label-mono", isBrand && "text-brand")}
        >
          {isBrand ? "Most popular" : "Plan"}
        </span>
      </div>

      <h3 className="text-xl font-semibold tracking-[-0.015em]">
        {plan.productName}
      </h3>

      {plan.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      ) : null}

      <div className="mt-8 flex items-baseline gap-2 border-y border-border py-6">
        <span className="text-4xl font-semibold tracking-[-0.025em] tabular-nums">
          {formatPriceAmount(schedule.unitAmount)}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {getBillingIntervalSuffix(interval)}
        </span>
      </div>

      {schedule.trialDays ? (
        <p className="mt-3 label-mono">
          With {schedule.trialDays}-day free trial
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-border border-t border-border">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-baseline gap-3 py-3 text-sm"
          >
            <span
              aria-hidden
              className={cn(
                "mt-[6px] size-1 shrink-0",
                isBrand ? "bg-brand" : "bg-muted-foreground/30",
              )}
            />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <form action={startSubscriptionCheckoutAction} className="mt-auto pt-8">
        <input type="hidden" name="planId" value={plan.planId} />
        <input type="hidden" name="billingInterval" value={interval} />
        <SubmitPricingButton highlighted={isBrand} />
      </form>
    </div>
  );
}

export function PricingToggle({ plans }: PricingToggleProps) {
  const annualEnabled = hasAnnualPlans(plans);
  const [interval, setInterval] = useState<BillingInterval>("month");
  const visiblePlans = plans.filter((plan) =>
    interval === "year" ? Boolean(plan.yearly) : Boolean(plan.monthly),
  );
  const gridClass =
    recurringGridCols[Math.min(visiblePlans.length, 3)] ?? recurringGridCols[3];

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <div className="inline-flex border border-border">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={cn(
              "px-5 py-2 text-sm font-medium transition-colors",
              interval === "month"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            disabled={!annualEnabled}
            className={cn(
              "px-5 py-2 text-sm font-medium transition-colors",
              interval === "year"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
              !annualEnabled && "cursor-not-allowed opacity-40",
            )}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className={`grid gap-px border border-border bg-border ${gridClass}`}>
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
