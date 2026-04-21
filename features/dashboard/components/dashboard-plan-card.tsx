import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/config/billing.config";
import { routes } from "@/constants/routes";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import {
  formatPriceAmount,
  getBillingIntervalSuffix,
} from "@/features/billing/format-price";
import {
  getPlanDisplayPrice,
  hasOngoingSubscription,
  isTrialingSubscription,
} from "@/features/billing/plans";
import { formatMonthDay } from "@/lib/date/format-date";
import { cn } from "@/lib/utils";

type DashboardPlanCardProps = {
  billingInterval: BillingInterval | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  planId: string;
  planName: string;
  subscriptionStatus: string | null;
  trialEnd: string | null;
  tasksUsage: number;
  taskLimit: number;
  aiCreditsUsage: number;
  aiCreditsLimit: number;
};

function resolveActiveInterval(
  planId: string,
  billingInterval: BillingInterval | null,
): BillingInterval | null {
  if (billingInterval && getPlanDisplayPrice(planId, billingInterval)) {
    return billingInterval;
  }
  if (getPlanDisplayPrice(planId, "month")) return "month";
  if (getPlanDisplayPrice(planId, "year")) return "year";
  return null;
}

function getStatus(planId: string, subscriptionStatus: string | null) {
  if (isTrialingSubscription(subscriptionStatus))
    return { label: "Trial", tone: "live" as const };
  if (hasOngoingSubscription(subscriptionStatus))
    return { label: "Active", tone: "live" as const };
  if (subscriptionStatus)
    return {
      label: subscriptionStatus.replaceAll("_", " "),
      tone: "inactive" as const,
    };
  return {
    label: planId === "free" ? "Free" : "Inactive",
    tone: "inactive" as const,
  };
}

function getRenewal(params: {
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  subscriptionStatus: string | null;
  trialEnd: string | null;
}) {
  if (isTrialingSubscription(params.subscriptionStatus) && params.trialEnd) {
    return `Trial ends ${formatMonthDay(params.trialEnd)}`;
  }
  if (!params.periodEnd) return null;
  const prefix = params.cancelAtPeriodEnd ? "Ends" : "Renews";
  return `${prefix} ${formatMonthDay(params.periodEnd)}`;
}

export function DashboardPlanCard({
  billingInterval,
  cancelAtPeriodEnd,
  periodEnd,
  planId,
  planName,
  subscriptionStatus,
  trialEnd,
  tasksUsage,
  taskLimit,
  aiCreditsUsage,
  aiCreditsLimit,
}: DashboardPlanCardProps) {
  const activeInterval = resolveActiveInterval(planId, billingInterval);
  const activePrice = activeInterval
    ? getPlanDisplayPrice(planId, activeInterval)
    : null;
  const status = getStatus(planId, subscriptionStatus);
  const renewal = getRenewal({
    cancelAtPeriodEnd,
    periodEnd,
    subscriptionStatus,
    trialEnd,
  });

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="label-mono">Current plan</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
            {planName}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            {activePrice && activeInterval
              ? `${formatPriceAmount(activePrice.unitAmount)} ${getBillingIntervalSuffix(activeInterval)}`
              : "No recurring billing"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span
            aria-hidden
            className={cn(
              "size-1.5",
              status.tone === "live" ? "bg-brand" : "bg-muted-foreground/50",
            )}
          />
          {status.label}
        </span>
      </div>

      <div className="flex-1 space-y-5 p-5">
        <UsageMeter label="Tasks" current={tasksUsage} limit={taskLimit} />
        <UsageMeter
          label="AI credits"
          current={aiCreditsUsage}
          limit={aiCreditsLimit}
        />
        {renewal ? <p className="label-mono">{renewal}</p> : null}
      </div>

      <div className="border-t border-border p-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-between font-mono text-[11px] uppercase tracking-[0.18em]"
        >
          <Link href={routes.settings.billing}>
            Manage billing
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
