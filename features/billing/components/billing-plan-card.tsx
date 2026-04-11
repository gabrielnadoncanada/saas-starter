"use client";

import {
  formatPriceAmount,
  getBillingIntervalSuffix,
} from "@/features/billing/format-price";
import { Badge } from "@/shared/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/shared/components/ui/field";
import { RadioGroupItem } from "@/shared/components/ui/radio-group";
import type {
  BillingInterval,
  BillingPrice,
  PlanId,
  PricingModel,
} from "@/shared/config/billing.config";

export type BillingPlanOption = {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricingModel: PricingModel;
  monthly: BillingPrice | null;
  yearly: BillingPrice | null;
};

export function getPlanPrice(
  plan: BillingPlanOption,
  interval: BillingInterval,
) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

function BillingPlanPrice({
  price,
  interval,
  pricingModel,
}: {
  price: BillingPrice | null;
  interval: BillingInterval;
  pricingModel: PricingModel;
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
          {getBillingIntervalSuffix(interval, pricingModel, "short")}
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
  plan: BillingPlanOption;
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
            pricingModel={plan.pricingModel}
          />
        </div>
      </FieldContent>
    </Field>
  );
}
