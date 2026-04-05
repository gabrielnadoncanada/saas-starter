"use client";

import { CircleCheckBigIcon } from "lucide-react";
import { useState } from "react";

import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.actions";
import { updateSubscriptionConfigurationAction } from "@/features/billing/actions/subscription-configuration.actions";
import type { BillingPlanOption } from "@/features/billing/catalog";
import {
  BillingIntervalSelector,
  BillingPlanRadioGroup,
  getPlanPrice,
} from "@/features/billing/components/billing-plan-selector-fields";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";

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
