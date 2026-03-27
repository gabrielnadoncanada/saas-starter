"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { checkoutAction } from "@/features/billing/actions/checkout.action";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.action";
import type { PlanId } from "@/features/billing/plans";
import {
  BillingIntervalSelector,
  BillingPlanRadioGroup,
  type BillingPlanOption,
} from "@/features/billing/components/billing-plan-selector-fields";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardDescription, CardHeader } from "@/shared/components/ui/card";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemFooter,
} from "@/shared/components/ui/item";
import { getPlan } from "@/shared/config/billing.config";
import { CheckIcon, CircleCheckBigIcon } from "lucide-react";
type BillingPlanSelectorProps = {
  plans: BillingPlanOption[];
  currentPlanId: PlanId;
  canManageBilling: boolean;
  canManagePortal: boolean;
};

export function BillingPlanSelector({
  plans,
  currentPlanId,
  canManageBilling,
  canManagePortal,
}: BillingPlanSelectorProps) {
  const formStatus = useFormStatus();
  const isPending = formStatus.pending;
  const defaultPlan =
    plans.find((plan) => plan.id === currentPlanId) ?? plans[0] ?? null;
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | undefined>(
    defaultPlan?.id,
  );
  const [interval, setInterval] = useState<"month" | "year">("month");

  if (!defaultPlan || !selectedPlanId) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            Aucun prix Stripe mensuel n&apos;est configure pour les forfaits
            affiches.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedPlan = getPlan(selectedPlanId);
  const selectedPrice =
    interval === "year"
      ? selectedPlan.prices.yearly
      : selectedPlan.prices.monthly;
  const annualEnabled = plans.some((plan) => Boolean(plan.yearly?.priceId));
  const selectingCurrentPlan =
    selectedPlan.id === currentPlanId && currentPlanId !== "free";

  return (
    <div className="space-y-6">
      <BillingIntervalSelector
        interval={interval}
        annualEnabled={annualEnabled}
        onValueChange={setInterval}
      />

      <BillingPlanRadioGroup
        plans={plans}
        currentPlanId={currentPlanId}
        interval={interval}
        selectedPlanId={selectedPlan.id}
        onValueChange={setSelectedPlanId}
      />

      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{selectedPlan.name}</ItemTitle>
          <ItemDescription>{selectedPlan.description}</ItemDescription>
          <div className="flex w-full flex-wrap gap-2 mt-1">
            {selectedPlan.features?.map((feature) => (
              <Badge key={feature} variant="outline">
                <CircleCheckBigIcon className="size-4 text-green-500" />
                {feature}
              </Badge>
            ))}
          </div>
        </ItemContent>
      </Item>

      {!canManageBilling ? (
        <Button disabled className="h-11 rounded-xl px-5">
          Reserve au proprietaire
        </Button>
      ) : selectingCurrentPlan && canManagePortal ? (
        <form action={customerPortalAction}>
          <Button type="submit" disabled={!canManagePortal || isPending}>
            Gerer l'abonnement
          </Button>
        </form>
      ) : (
        <form action={checkoutAction}>
          <input
            type="hidden"
            name="priceId"
            value={selectedPrice?.priceId ?? ""}
          />
          <Button type="submit" disabled={!selectedPrice}>
            Proceder au paiement
          </Button>
        </form>
      )}
    </div>
  );
}
