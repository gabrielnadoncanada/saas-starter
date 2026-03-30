"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { checkoutAction } from "@/features/billing/actions/checkout.action";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.action";
import { type BillingInterval, type PlanId } from "@/features/billing/plans";
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
} from "@/shared/components/ui/item";
import { CircleCheckBigIcon } from "lucide-react";

type BillingPlanSelectorProps = {
  plans: BillingPlanOption[];
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  canManageBilling: boolean;
  hasCurrentSubscription: boolean;
  canManagePortal: boolean;
};

function getPlanPrice(plan: BillingPlanOption, interval: BillingInterval) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

export function BillingPlanSelector({
  plans,
  currentBillingInterval,
  currentPlanId,
  canManageBilling,
  hasCurrentSubscription,
  canManagePortal,
}: BillingPlanSelectorProps) {
  const formStatus = useFormStatus();
  const isPending = formStatus.pending;
  const defaultPlan =
    plans.find((plan) => plan.id === currentPlanId) ?? plans[0] ?? null;
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | undefined>(
    defaultPlan?.id,
  );
  const [interval, setInterval] = useState<"month" | "year">(
    currentBillingInterval ?? "month",
  );

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

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? defaultPlan;
  const selectedPrice = getPlanPrice(selectedPlan, interval);
  const annualEnabled = plans.some((plan) => Boolean(plan.yearly));
  const isCurrentSelection =
    hasCurrentSubscription &&
    selectedPlan.id === currentPlanId &&
    currentBillingInterval === interval;

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
      ) : hasCurrentSubscription && canManagePortal ? (
        <div className="space-y-2">
          <form action={customerPortalAction}>
            <Button type="submit" disabled={!canManagePortal || isPending}>
              {isCurrentSelection
                ? "Gerer l'abonnement dans Stripe"
                : "Changer ce forfait dans Stripe"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Les changements de forfait ou de frequence se font dans le portail
            Stripe.
          </p>
        </div>
      ) : hasCurrentSubscription ? (
        <div className="space-y-2">
          <Button disabled className="h-11 rounded-xl px-5">
            Abonnement deja actif
          </Button>
          <p className="text-sm text-muted-foreground">
            Cet espace a deja un abonnement en cours. Le portail Stripe n&apos;est
            pas disponible tant que le client Stripe n&apos;est pas synchronise.
          </p>
        </div>
      ) : (
        <form action={checkoutAction}>
          <input type="hidden" name="planId" value={selectedPlan.id} />
          <input type="hidden" name="billingInterval" value={interval} />
          <Button type="submit" disabled={!selectedPrice}>
            Proceder au paiement
          </Button>
        </form>
      )}
    </div>
  );
}
