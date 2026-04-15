"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type DashboardSparklineProps = {
  data: Array<{ value: number }>;
  color?: string;
  className?: string;
};

export function DashboardSparkline({
  data,
  color = "var(--brand)",
  className,
}: DashboardSparklineProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id={`spark-${color.replace(/[^a-z]/gi, "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace(/[^a-z]/gi, "")})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
