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

import type { AdminSignupsSeries } from "@/features/admin/server/get-admin-overview";

export function AdminSignupsChart({ data }: { data: AdminSignupsSeries[] }) {
  const usersTotal = data.reduce((acc, d) => acc + d.users, 0);
  const orgsTotal = data.reduce((acc, d) => acc + d.orgs, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono">Growth · Last 30 days</p>
          <div className="mt-2 flex items-baseline gap-6">
            <Stat label="Signups" value={usersTotal} color="var(--brand)" />
            <Stat
              label="New orgs"
              value={orgsTotal}
              color="hsl(var(--brand-hsl) / 0.55)"
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
              <linearGradient id="grad-users" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-orgs" x1="0" y1="0" x2="0" y2="1">
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
              minTickGap={32}
            />
            <Tooltip
              cursor={{ stroke: "var(--brand)", strokeOpacity: 0.4 }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="orgs"
              name="New orgs"
              stroke="hsl(var(--brand-hsl) / 0.55)"
              strokeWidth={1.5}
              fill="url(#grad-orgs)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="users"
              name="Signups"
              stroke="var(--brand)"
              strokeWidth={1.75}
              fill="url(#grad-users)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-1.5"
          style={{ backgroundColor: color }}
        />
        <span className="label-mono">{label}</span>
      </span>
      <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </span>
    </div>
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
    <div className="border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="label-mono">{label}</p>
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
