"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
};

export function DashboardUsageChart({
  data,
}: {
  data: Array<{ label: string; tasks: number }>;
}) {
  return (
    <ChartContainer className="h-64 w-full" config={chartConfig}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="tasks" radius={8} fill="var(--color-tasks)" />
      </BarChart>
    </ChartContainer>
  );
}
