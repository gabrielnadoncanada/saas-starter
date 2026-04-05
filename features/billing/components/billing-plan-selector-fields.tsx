"use client";

import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/shared/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import type {
  BillingInterval,
  BillingPrice,
  PlanId,
  PricingModel,
} from "@/shared/config/billing.config";

export type BillingPlanOption = {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  pricingModel: PricingModel;
  monthly: BillingPrice | null;
  yearly: BillingPrice | null;
};

type BillingIntervalSelectorProps = {
  interval: BillingInterval;
  annualEnabled: boolean;
  onValueChange: (value: BillingInterval) => void;
};

type BillingPlanRadioGroupProps = {
  plans: BillingPlanOption[];
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  interval: BillingInterval;
  selectedPlanId: PlanId;
  onValueChange: (value: PlanId) => void;
};

type BillingPlanCardProps = {
  plan: BillingPlanOption;
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  interval: BillingInterval;
};

function formatPrice(unitAmount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(unitAmount / 100);
}

function getPriceSuffix(
  interval: BillingInterval,
  pricingModel: PricingModel,
  t: (key: string) => string,
) {
  if (pricingModel === "per_seat") {
    return interval === "year" ? t("plan.perSeatYear") : t("plan.perSeatMonth");
  }

  return interval === "year" ? t("plan.perYear") : t("plan.perMonth");
}

function getPlanPrice(plan: BillingPlanOption, interval: BillingInterval) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
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
  const locale = useLocale();
  const t = useTranslations("billing");

  return (
    <div className="space-y-1 md:text-right">
      <div className="text-xl font-semibold tracking-tight">
        {price ? formatPrice(price.unitAmount, locale) : "Unavailable"}
      </div>

      {price ? (
        <FieldDescription>
          {getPriceSuffix(interval, pricingModel, t)}
        </FieldDescription>
      ) : null}
    </div>
  );
}

function BillingPlanCard({
  plan,
  currentBillingInterval,
  currentPlanId,
  interval,
}: BillingPlanCardProps) {
  const t = useTranslations("billing");
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

export function BillingIntervalSelector({
  interval,
  annualEnabled,
  onValueChange,
}: BillingIntervalSelectorProps) {
  const t = useTranslations("billing");

  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">Billing frequency</FieldLegend>

      <RadioGroup
        value={interval}
        onValueChange={(value) => {
          if (isBillingInterval(value)) {
            onValueChange(value);
          }
        }}
        className="grid gap-3 md:grid-cols-2"
      >
        <FieldLabel htmlFor="billing-interval-month">
          <Field orientation="horizontal">
            <RadioGroupItem value="month" id="billing-interval-month" />
            <FieldContent>
              <FieldTitle>Monthly</FieldTitle>
              <FieldDescription>Pay every month.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>

        <FieldLabel htmlFor="billing-interval-year">
          <Field orientation="horizontal">
            <RadioGroupItem
              value="year"
              id="billing-interval-year"
              disabled={!annualEnabled}
            />
            <FieldContent>
              <FieldTitle>Yearly</FieldTitle>
              <FieldDescription>
                {annualEnabled
                  ? "Pay annually."
                  : "No yearly price available."}
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  );
}

export function BillingPlanRadioGroup({
  plans,
  currentBillingInterval,
  currentPlanId,
  interval,
  selectedPlanId,
  onValueChange,
}: BillingPlanRadioGroupProps) {
  const t = useTranslations("billing");

  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">Choose a plan</FieldLegend>

      <RadioGroup
        value={selectedPlanId}
        onValueChange={(value) => {
          const selectedPlan = plans.find((plan) => plan.id === value);

          if (selectedPlan) {
            onValueChange(selectedPlan.id);
          }
        }}
        className="gap-3"
      >
        {plans.map((plan) => {
          return (
            <FieldLabel key={plan.id} htmlFor={`billing-plan-${plan.id}`}>
              <BillingPlanCard
                plan={plan}
                currentBillingInterval={currentBillingInterval}
                currentPlanId={currentPlanId}
                interval={interval}
              />
            </FieldLabel>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}
