"use client";

import { CircleCheckBigIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import {
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup } from "@/components/ui/radio-group";
import type {
  BillingInterval,
  PlanId,
} from "@/config/billing.config";
import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import { openBillingPortalAction } from "@/features/billing/actions/customer-portal.actions";
import { changePlanAction } from "@/features/billing/actions/subscription-configuration.actions";
import { BillingIntervalSelector } from "@/features/billing/components/billing-interval-selector";
import {
  BillingPlanCard,
  type BillingPlanOption,
  getPlanPrice,
} from "@/features/billing/components/billing-plan-card";
import { hasAnnualPlans } from "@/features/billing/plans";

export type { BillingPlanOption } from "@/features/billing/components/billing-plan-card";

type BillingPlanSelectorProps = {
  canManageBilling: boolean;
  canManagePortal: boolean;
  canUpdateSubscription: boolean;
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  hasCurrentSubscription: boolean;
  plans: BillingPlanOption[];
};

function BillingPlanRadioGroup({
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
  selectedPlanId: string;
  onValueChange: (value: string) => void;
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
        {plans.map((plan) => (
          <FieldLabel key={plan.id} htmlFor={`billing-plan-${plan.id}`}>
            <BillingPlanCard
              plan={plan}
              currentBillingInterval={currentBillingInterval}
              currentPlanId={currentPlanId}
              interval={interval}
            />
          </FieldLabel>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}

export function BillingPlanSelector({
  plans,
  currentBillingInterval,
  currentPlanId,
  canManageBilling,
  hasCurrentSubscription,
  canManagePortal,
  canUpdateSubscription,
}: BillingPlanSelectorProps) {
  const defaultPlan =
    plans.find((plan) => plan.id === currentPlanId) ?? plans[0] ?? null;
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    defaultPlan?.id,
  );
  const [interval, setInterval] = useState<BillingInterval>(
    currentBillingInterval ?? "month",
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
  const annualEnabled = hasAnnualPlans(plans);
  const subscriptionAction =
    hasCurrentSubscription && canUpdateSubscription
      ? changePlanAction
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
                <CircleCheckBigIcon className="size-4 text-brand" />
                {feature}
              </Badge>
            ))}
          </div>
        </ItemContent>
      </Item>

      {!canManageBilling ? (
        <Button disabled className="h-11 px-5">
          Only the owner can manage billing
        </Button>
      ) : (
        <div className="space-y-3">
          <form action={subscriptionAction} className="space-y-3">
            <input type="hidden" name="planId" value={selectedPlan.id} />
            <input type="hidden" name="billingInterval" value={interval} />
            <Button type="submit" disabled={!selectedPrice}>
              {getSubmitLabel()}
            </Button>
          </form>

          {canManagePortal ? (
            <form action={openBillingPortalAction}>
              <Button type="submit" variant="outline">
                Open billing portal
              </Button>
            </form>
          ) : null}

          {hasCurrentSubscription && !canUpdateSubscription ? (
            <p className="text-sm text-muted-foreground">
              This organization already has an active subscription. The Stripe
              portal is not available until the Stripe customer is synced.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
