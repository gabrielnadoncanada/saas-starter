"use client";

import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type {
  BillingInterval,
  BillingPrice,
  PlanId,
} from "@/config/billing.config";
import {
  formatPriceAmount,
  getBillingIntervalSuffix,
} from "@/features/billing/format-price";
import type { PricingPlanView } from "@/features/billing/types";

export function getPlanPrice(
  plan: PricingPlanView,
  interval: BillingInterval,
) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

function BillingPlanPrice({
  price,
  interval,
}: {
  price: BillingPrice | null;
  interval: BillingInterval;
}) {
  return (
    <div className="space-y-1 md:text-right">
      <div className="text-xl font-semibold tracking-tight">
        {price
          ? formatPriceAmount(price.unitAmount, { minimumFractionDigits: 2 })
          : "Unavailable"}
      </div>

      {price ? (
        <FieldDescription>
          {getBillingIntervalSuffix(interval, "short")}
        </FieldDescription>
      ) : null}
    </div>
  );
}

export function BillingPlanCard({
  plan,
  currentBillingInterval,
  currentPlanId,
  interval,
}: {
  plan: PricingPlanView;
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  interval: BillingInterval;
}) {
  const price = getPlanPrice(plan, interval);
  const isCurrentSelection =
    plan.id === currentPlanId &&
    currentPlanId !== "free" &&
    currentBillingInterval === interval;

  return (
    <Field orientation="horizontal" className="items-start gap-4">
      <RadioGroupItem
        value={plan.id}
        id={`billing-plan-${plan.id}`}
        className="mt-1"
      />

      <FieldContent className="gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FieldTitle>{plan.name}</FieldTitle>

              {isCurrentSelection ? (
                <Badge variant="secondary">Current selection</Badge>
              ) : null}
            </div>

            <FieldDescription>{plan.description}</FieldDescription>
          </div>

          <BillingPlanPrice
            price={price}
            interval={interval}
          />
        </div>
      </FieldContent>
    </Field>
  );
}
