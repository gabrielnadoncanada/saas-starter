"use client";

import { CircleCheckBigIcon } from "lucide-react";
import { useState } from "react";

import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.actions";
import { updateSubscriptionConfigurationAction } from "@/features/billing/actions/subscription-configuration.actions";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/shared/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import type {
  BillingInterval,
  BillingPrice,
  PlanId,
  PricingModel,
} from "@/shared/config/billing.config";

type BillingPlanOption = {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricingModel: PricingModel;
  monthly: BillingPrice | null;
  yearly: BillingPrice | null;
};

// --- Price helpers ---

const PRICE_LOCALE = "en-US";

function formatPrice(unitAmount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(unitAmount / 100);
}

function getPriceSuffix(interval: BillingInterval, pricingModel: PricingModel) {
  if (pricingModel === "per_seat") {
    return interval === "year" ? "per seat / yr" : "per seat / mo";
  }

  return interval === "year" ? "/ yr" : "/ mo";
}

export function getPlanPrice(plan: BillingPlanOption, interval: BillingInterval) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

// --- Subcomponents ---

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
        {price ? formatPrice(price.unitAmount, PRICE_LOCALE) : "Unavailable"}
      </div>

      {price ? (
        <FieldDescription>
          {getPriceSuffix(interval, pricingModel)}
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

export function BillingIntervalSelector({
  interval,
  annualEnabled,
  onValueChange,
}: {
  interval: BillingInterval;
  annualEnabled: boolean;
  onValueChange: (value: BillingInterval) => void;
}) {
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
                {annualEnabled ? "Pay annually." : "No yearly price available."}
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
}: {
  plans: BillingPlanOption[];
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  interval: BillingInterval;
  selectedPlanId: PlanId;
  onValueChange: (value: PlanId) => void;
}) {
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

// --- Main component ---

type BillingPlanSelectorProps = {
  canManageBilling: boolean;
  canManagePortal: boolean;
  canUpdateSubscription: boolean;
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  currentSeatQuantity: number;
  hasCurrentSubscription: boolean;
  plans: BillingPlanOption[];
};

export function BillingPlanSelector({
  plans,
  currentBillingInterval,
  currentPlanId,
  currentSeatQuantity,
  canManageBilling,
  hasCurrentSubscription,
  canManagePortal,
  canUpdateSubscription,
}: BillingPlanSelectorProps) {
  const defaultPlan =
    plans.find((plan) => plan.id === currentPlanId) ?? plans[0] ?? null;
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | undefined>(
    defaultPlan?.id,
  );
  const [interval, setInterval] = useState<BillingInterval>(
    currentBillingInterval ?? "month",
  );
  const [seatQuantity, setSeatQuantity] = useState(
    Math.max(1, currentSeatQuantity),
  );

  if (!defaultPlan || !selectedPlanId) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            No monthly Stripe price is configured for the displayed plans.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? defaultPlan;
  const selectedPrice = getPlanPrice(selectedPlan, interval);
  const annualEnabled = plans.some((plan) => Boolean(plan.yearly));
  const subscriptionAction =
    hasCurrentSubscription && canUpdateSubscription
      ? updateSubscriptionConfigurationAction
      : startSubscriptionCheckoutAction;

  function getSubmitLabel() {
    if (!hasCurrentSubscription || !canUpdateSubscription) {
      return "Proceed to payment";
    }

    const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
    const selectedIndex = plans.findIndex((p) => p.id === selectedPlanId);

    if (currentIndex >= 0 && selectedIndex >= 0) {
      if (selectedIndex > currentIndex) return "Upgrade";
      if (selectedIndex < currentIndex) return "Downgrade";
    }

    return "Update subscription";
  }

  return (
    <div className="space-y-6">
      <BillingIntervalSelector
        interval={interval}
        annualEnabled={annualEnabled}
        onValueChange={setInterval}
      />

      <BillingPlanRadioGroup
        plans={plans}
        currentBillingInterval={currentBillingInterval}
        currentPlanId={currentPlanId}
        interval={interval}
        selectedPlanId={selectedPlan.id}
        onValueChange={setSelectedPlanId}
      />

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{selectedPlan.name}</ItemTitle>
          <ItemDescription>{selectedPlan.description}</ItemDescription>
          <div className="mt-1 flex w-full flex-wrap gap-2">
            {selectedPlan.features.map((feature) => (
              <Badge key={feature} variant="outline">
                <CircleCheckBigIcon className="size-4 text-green-500" />
                {feature}
              </Badge>
            ))}
          </div>
        </ItemContent>
      </Item>

      {selectedPlan.pricingModel === "per_seat" ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium">Seat quantity</span>
          <Input
            min={1}
            type="number"
            value={seatQuantity}
            onChange={(event) =>
              setSeatQuantity(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </label>
      ) : null}

      {!canManageBilling ? (
        <Button disabled className="h-11 rounded-xl px-5">
          Only the owner can manage billing
        </Button>
      ) : (
        <div className="space-y-3">
          <form action={subscriptionAction} className="space-y-3">
            <input type="hidden" name="planId" value={selectedPlan.id} />
            <input type="hidden" name="billingInterval" value={interval} />
            <input type="hidden" name="seatQuantity" value={seatQuantity} />
            <Button type="submit" disabled={!selectedPrice}>
              {getSubmitLabel()}
            </Button>
          </form>

          {canManagePortal ? (
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Open billing portal
              </Button>
            </form>
          ) : null}

          {hasCurrentSubscription && !canUpdateSubscription ? (
            <p className="text-sm text-muted-foreground">
              This workspace already has an active subscription. The Stripe
              portal is not available until the Stripe customer is synced.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
