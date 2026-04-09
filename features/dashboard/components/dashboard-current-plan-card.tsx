import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getPlanDisplayPrice } from "@/features/billing/catalog";
import { hasCurrentStripeSubscription } from "@/features/billing/subscription-status";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type {
  BillingInterval,
  PricingModel,
} from "@/shared/config/billing.config";
import { routes } from "@/shared/constants/routes";

type DashboardCurrentPlanCardProps = {
  billingInterval: BillingInterval | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  planId: string;
  planName: string;
  pricingModel: PricingModel;
  subscriptionStatus: string | null;
};

function formatPlanPrice(unitAmount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

function getPriceSuffix(
  interval: BillingInterval,
  pricingModel: PricingModel,
) {
  if (pricingModel === "per_seat") {
    return interval === "year" ? "/ seat / year" : "/ seat / month";
  }

  return interval === "year" ? "/ year" : "/ month";
}

function getStatusLabel(planId: string, subscriptionStatus: string | null) {
  if (hasCurrentStripeSubscription(subscriptionStatus)) {
    return "Active";
  }

  if (subscriptionStatus) {
    return subscriptionStatus.replaceAll("_", " ");
  }

  return planId === "free" ? "Free" : "No subscription";
}

function getRenewalText(params: {
  cancelAtPeriodEnd: boolean;
  hasStripeSubscription: boolean;
  periodEnd: string | null;
}) {
  if (!params.periodEnd) {
    return null;
  }

  const prefix = params.cancelAtPeriodEnd
    ? "Ends on"
    : params.hasStripeSubscription
      ? "Renews on"
      : "Period ends on";

  return `${prefix} ${format(new Date(params.periodEnd), "MMM d, yyyy")}`;
}

export function DashboardCurrentPlanCard({
  billingInterval,
  cancelAtPeriodEnd,
  periodEnd,
  planId,
  planName,
  pricingModel,
  subscriptionStatus,
}: DashboardCurrentPlanCardProps) {
  const activeInterval =
    billingInterval && getPlanDisplayPrice(planId, billingInterval)
      ? billingInterval
      : getPlanDisplayPrice(planId, "month")
        ? "month"
        : getPlanDisplayPrice(planId, "year")
          ? "year"
          : null;
  const activePrice = activeInterval
    ? getPlanDisplayPrice(planId, activeInterval)
    : null;
  const hasStripeSubscription = hasCurrentStripeSubscription(subscriptionStatus);
  const renewalText = getRenewalText({
    cancelAtPeriodEnd,
    hasStripeSubscription,
    periodEnd,
  });

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardDescription>Current Plan</CardDescription>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{planName}</CardTitle>
          <Badge variant="secondary">{getStatusLabel(planId, subscriptionStatus)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-heading text-2xl font-semibold">
            {activePrice ? formatPlanPrice(activePrice.unitAmount) : "Free"}
            {activeInterval ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {getPriceSuffix(activeInterval, pricingModel)}
              </span>
            ) : null}
          </p>

          {renewalText ? (
            <p className="text-sm text-muted-foreground">{renewalText}</p>
          ) : null}
        </div>

        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={routes.settings.billing}>
            Manage billing
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
