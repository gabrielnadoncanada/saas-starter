"use client";

import { CircleCheckBigIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  startSubscriptionCheckoutAction,
} from "@/features/billing/actions/checkout.actions";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.actions";
import { updateSubscriptionConfigurationAction } from "@/features/billing/actions/subscription-configuration.actions";
import {
  BillingIntervalSelector,
  type BillingPlanOption,
  BillingPlanRadioGroup,
} from "@/features/billing/components/billing-plan-selector-fields";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";

type BillingAddonOption = {
  id: string;
  name: string;
  description: string;
  monthly: { unitAmount: number } | null;
  yearly: { unitAmount: number } | null;
};

type BillingPlanSelectorProps = {
  addons: BillingAddonOption[];
  canManageBilling: boolean;
  canManagePortal: boolean;
  canUpdateSubscription: boolean;
  currentAddonIds: string[];
  currentBillingInterval: BillingInterval | null;
  currentPlanId: PlanId;
  currentSeatQuantity: number;
  hasCurrentSubscription: boolean;
  plans: BillingPlanOption[];
};

function getPlanPrice(plan: BillingPlanOption, interval: BillingInterval) {
  return interval === "year" ? plan.yearly : plan.monthly;
}

function getAddonPrice(
  addon: BillingAddonOption,
  interval: BillingInterval,
) {
  return interval === "year" ? addon.yearly : addon.monthly;
}

export function BillingPlanSelector({
  addons,
  plans,
  currentAddonIds,
  currentBillingInterval,
  currentPlanId,
  currentSeatQuantity,
  canManageBilling,
  hasCurrentSubscription,
  canManagePortal,
  canUpdateSubscription,
}: BillingPlanSelectorProps) {
  const t = useTranslations("billing.actions");
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
  const [selectedAddonIds, setSelectedAddonIds] =
    useState<string[]>(currentAddonIds);

  if (!defaultPlan || !selectedPlanId) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>{t("noMonthlyPrice")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? defaultPlan;
  const selectedPrice = getPlanPrice(selectedPlan, interval);
  const annualEnabled = plans.some((plan) => Boolean(plan.yearly));
  const visibleAddons = addons.filter((addon) => Boolean(getAddonPrice(addon, interval)));
  const subscriptionAction =
    hasCurrentSubscription && canUpdateSubscription
      ? updateSubscriptionConfigurationAction
      : startSubscriptionCheckoutAction;

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
    );
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
          <span className="text-sm font-medium">{t("seatQuantity")}</span>
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

      {visibleAddons.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("addonsLegend")}</p>
          {visibleAddons.map((addon) => (
            <label key={addon.id} className="flex items-start gap-3 rounded-xl border p-3">
              <Checkbox
                checked={selectedAddonIds.includes(addon.id)}
                onCheckedChange={() => toggleAddon(addon.id)}
              />
              <div className="space-y-1">
                <p className="font-medium">{addon.name}</p>
                <p className="text-sm text-muted-foreground">{addon.description}</p>
              </div>
            </label>
          ))}
        </div>
      ) : null}

      {!canManageBilling ? (
        <Button disabled className="h-11 rounded-xl px-5">
          {t("ownerOnly")}
        </Button>
      ) : (
        <div className="space-y-3">
          <form action={subscriptionAction} className="space-y-3">
            <input type="hidden" name="planId" value={selectedPlan.id} />
            <input type="hidden" name="billingInterval" value={interval} />
            <input type="hidden" name="seatQuantity" value={seatQuantity} />
            {selectedAddonIds.map((addonId) => (
              <input key={addonId} type="hidden" name="addonIds" value={addonId} />
            ))}
            <Button type="submit" disabled={!selectedPrice}>
              {hasCurrentSubscription && canUpdateSubscription
                ? t("updateSubscription")
                : t("proceedToPayment")}
            </Button>
          </form>

          {canManagePortal ? (
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                {t("openPortal")}
              </Button>
            </form>
          ) : null}

          {hasCurrentSubscription && !canUpdateSubscription ? (
            <p className="text-sm text-muted-foreground">
              {t("alreadyActiveHelp")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
