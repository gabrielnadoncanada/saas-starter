import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/config/billing.config";
import { routes } from "@/constants/routes";
import {
  getPlanDisplayPrice,
  hasOngoingSubscription,
  isTrialingSubscription,
} from "@/features/billing/plans";
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

function formatPlanPrice(unitAmount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

function getStatus(planId: string, subscriptionStatus: string | null) {
  if (isTrialingSubscription(subscriptionStatus)) return "Trial";
  if (hasOngoingSubscription(subscriptionStatus)) return "Active";
  if (subscriptionStatus) return subscriptionStatus.replaceAll("_", " ");
  return planId === "free" ? "Free" : "Inactive";
}

function getRenewal(params: {
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  subscriptionStatus: string | null;
  trialEnd: string | null;
}) {
  if (isTrialingSubscription(params.subscriptionStatus) && params.trialEnd) {
    return `Trial ends ${format(new Date(params.trialEnd), "MMM d")}`;
  }
  if (!params.periodEnd) return null;
  const prefix = params.cancelAtPeriodEnd ? "Ends" : "Renews";
  return `${prefix} ${format(new Date(params.periodEnd), "MMM d")}`;
}

function getPercent(current: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}

function formatInt(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
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
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Current plan
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
            {planName}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            {activePrice
              ? `${formatPlanPrice(activePrice.unitAmount)} / ${activeInterval === "year" ? "year" : "month"}`
              : "No recurring billing"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span
            aria-hidden
            className={cn(
              "size-1.5",
              status === "Active" || status === "Trial"
                ? "bg-brand"
                : "bg-muted-foreground/50",
            )}
          />
          {status}
        </span>
      </div>

      <div className="flex-1 space-y-5 p-5">
        <UsageBar
          label="Tasks"
          current={tasksUsage}
          limit={taskLimit}
        />
        <UsageBar
          label="AI credits"
          current={aiCreditsUsage}
          limit={aiCreditsLimit}
        />
        {renewal ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {renewal}
          </p>
        ) : null}
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

function UsageBar({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const percent = getPercent(current, limit);
  const isHigh = percent >= 80;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-[11px] tabular-nums">
          <span className="font-semibold">{formatInt(current)}</span>
          <span className="text-muted-foreground"> / {formatInt(limit)}</span>
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-[width]",
            isHigh ? "bg-destructive" : "bg-brand",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
