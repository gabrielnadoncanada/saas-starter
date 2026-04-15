"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type Series = {
  label: string;
  tasks: number;
  ai: number;
};

type Metric = "tasks" | "ai" | "both";

const metricMeta: Record<
  Exclude<Metric, "both">,
  { label: string; color: string }
> = {
  tasks: { label: "Tasks", color: "var(--brand)" },
  ai: { label: "AI calls", color: "hsl(var(--brand-hsl) / 0.55)" },
};

export function DashboardActivityChart({ data }: { data: Series[] }) {
  const [metric, setMetric] = React.useState<Metric>("both");

  const tasksTotal = data.reduce((acc, d) => acc + d.tasks, 0);
  const aiTotal = data.reduce((acc, d) => acc + d.ai, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Workspace activity · Last 14 days
          </p>
          <div className="mt-2 flex items-baseline gap-6">
            <Metric
              active={metric === "tasks" || metric === "both"}
              label="Tasks"
              value={tasksTotal}
              color="var(--brand)"
              onClick={() => setMetric(metric === "tasks" ? "both" : "tasks")}
            />
            <Metric
              active={metric === "ai" || metric === "both"}
              label="AI calls"
              value={aiTotal}
              color="hsl(var(--brand-hsl) / 0.55)"
              onClick={() => setMetric(metric === "ai" ? "both" : "ai")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="grad-tasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-ai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--brand-hsl) / 0.55)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--brand-hsl) / 0.55)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
                fill: "var(--muted-foreground)",
                fontFamily: "var(--font-mono, monospace)",
              }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <Tooltip
              cursor={{ stroke: "var(--brand)", strokeOpacity: 0.4 }}
              content={<ChartTooltip />}
            />
            {(metric === "ai" || metric === "both") && (
              <Area
                type="monotone"
                dataKey="ai"
                name={metricMeta.ai.label}
                stroke="hsl(var(--brand-hsl) / 0.55)"
                strokeWidth={1.5}
                fill="url(#grad-ai)"
                isAnimationActive={false}
              />
            )}
            {(metric === "tasks" || metric === "both") && (
              <Area
                type="monotone"
                dataKey="tasks"
                name={metricMeta.tasks.label}
                stroke="var(--brand)"
                strokeWidth={1.75}
                fill="url(#grad-tasks)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Metric({
  active,
  label,
  value,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-1 text-left transition-opacity",
        active ? "opacity-100" : "opacity-50 hover:opacity-80",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-1.5"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </span>
      <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </span>
    </button>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-border bg-popover px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-1.5"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </span>
            <span className="font-medium tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
