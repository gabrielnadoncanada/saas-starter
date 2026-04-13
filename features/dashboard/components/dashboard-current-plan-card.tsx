import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BillingInterval } from "@/config/billing.config";
import { routes } from "@/constants/routes";
import {
  getPlanDisplayPrice,
  hasOngoingSubscription,
  isTrialingSubscription,
} from "@/features/billing/plans";

type DashboardCurrentPlanCardProps = {
  billingInterval: BillingInterval | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  planId: string;
  planName: string;
  subscriptionStatus: string | null;
  trialEnd: string | null;
};

function formatPlanPrice(unitAmount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

function getPriceSuffix(interval: BillingInterval) {
  return interval === "year" ? "/ year" : "/ month";
}

function getStatusLabel(planId: string, subscriptionStatus: string | null) {
  if (isTrialingSubscription(subscriptionStatus)) {
    return "Trial";
  }

  if (hasOngoingSubscription(subscriptionStatus)) {
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
  subscriptionStatus: string | null;
  trialEnd: string | null;
}) {
  if (isTrialingSubscription(params.subscriptionStatus)) {
    if (!params.trialEnd) {
      return "Trial active";
    }

    return `Trial ends on ${format(new Date(params.trialEnd), "MMM d, yyyy")}`;
  }

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
  subscriptionStatus,
  trialEnd,
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
  const hasStripeSubscription =
    hasOngoingSubscription(subscriptionStatus);
  const renewalText = getRenewalText({
    cancelAtPeriodEnd,
    hasStripeSubscription,
    periodEnd,
    subscriptionStatus,
    trialEnd,
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Current Plan</CardDescription>
        <CardAction>
          <Badge variant="secondary">
            {getStatusLabel(planId, subscriptionStatus)}
          </Badge>
        </CardAction>
        <CardTitle>{planName}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-heading text-2xl font-semibold">
            {activePrice ? formatPlanPrice(activePrice.unitAmount) : "Free"}
            {activeInterval ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {getPriceSuffix(activeInterval)}
              </span>
            ) : null}
          </p>

          {renewalText ? (
            <p className="text-sm text-muted-foreground">{renewalText}</p>
          ) : null}
        </div>
        <Separator />
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Billing cadence</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeInterval
              ? activeInterval === "year"
                ? "Yearly plan billing"
                : "Monthly plan billing"
              : "No recurring billing"}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={routes.settings.billing}>
            Manage billing
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
