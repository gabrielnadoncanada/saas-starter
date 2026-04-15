import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import type { DashboardDelta } from "@/features/dashboard/server/get-dashboard-overview";

type DashboardKpiCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  delta?: DashboardDelta;
  visual?: React.ReactNode;
  accent?: boolean;
  className?: string;
};

export function DashboardKpiCard({
  label,
  value,
  hint,
  delta,
  visual,
  accent = false,
  className,
}: DashboardKpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-card p-5",
        className,
      )}
    >
      {accent ? (
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-brand" />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {delta ? <DeltaBadge delta={delta} /> : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tracking-[-0.02em] tabular-nums">
            {value}
          </span>
          {hint ? (
            <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </div>
        {visual ? (
          <div className="h-10 w-24 shrink-0 sm:w-28">{visual}</div>
        ) : null}
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: DashboardDelta }) {
  const Icon =
    delta.direction === "up"
      ? ArrowUpRight
      : delta.direction === "down"
        ? ArrowDownRight
        : Minus;

  const colorClass =
    delta.direction === "up"
      ? "text-brand"
      : delta.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[10px] tabular-nums",
        colorClass,
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {delta.direction === "flat" ? "0%" : `${delta.percent}%`}
    </span>
  );
}
