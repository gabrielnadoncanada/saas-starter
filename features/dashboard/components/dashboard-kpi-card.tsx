import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import * as React from "react";

import type { DashboardDelta } from "@/features/dashboard/server/get-dashboard-overview";
import { cn } from "@/lib/utils";

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
        <p className="label-mono">{label}</p>
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

const DELTA_STYLES = {
  up: { Icon: ArrowUpRight, colorClass: "text-brand" },
  down: { Icon: ArrowDownRight, colorClass: "text-destructive" },
  flat: { Icon: Minus, colorClass: "text-muted-foreground" },
} as const;

function DeltaBadge({ delta }: { delta: DashboardDelta }) {
  const { Icon, colorClass } = DELTA_STYLES[delta.direction];

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
