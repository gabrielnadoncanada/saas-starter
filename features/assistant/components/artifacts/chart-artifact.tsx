"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartSpec } from "@/features/assistant/types";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

const DEFAULT_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

function getSeriesColor(series: ChartSpec["series"], index: number): string {
  return series[index]?.color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}

function buildConfig(chart: ChartSpec): ChartConfig {
  const config: ChartConfig = {};

  chart.series.forEach((s, i) => {
    config[s.dataKey] = {
      label: s.label,
      color: getSeriesColor(chart.series, i),
    };
  });

  return config;
}

function renderChart(chart: ChartSpec) {
  switch (chart.type) {
    case "bar": {
      const hasPerRowColors = chart.data.some((row) => typeof row.color === "string");
      return (
        <BarChart data={chart.data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={chart.xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {chart.series.map((s, i) => {
            const seriesColor = getSeriesColor(chart.series, i);
            return (
              <Bar key={s.dataKey} dataKey={s.dataKey} fill={seriesColor} radius={4}>
                {hasPerRowColors &&
                  chart.data.map((row, j) => (
                    <Cell
                      key={String(row[chart.xAxisKey] ?? j)}
                      fill={typeof row.color === "string" ? row.color : seriesColor}
                    />
                  ))}
              </Bar>
            );
          })}
        </BarChart>
      );
    }

    case "line":
      return (
        <LineChart data={chart.data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={chart.xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {chart.series.map((s, i) => (
            <Line
              key={s.dataKey}
              dataKey={s.dataKey}
              type="monotone"
              stroke={getSeriesColor(chart.series, i)}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      );

    case "area":
      return (
        <AreaChart data={chart.data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={chart.xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {chart.series.map((s, i) => {
            const color = getSeriesColor(chart.series, i);
            return (
              <Area
                key={s.dataKey}
                dataKey={s.dataKey}
                type="monotone"
                fill={color}
                stroke={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            );
          })}
        </AreaChart>
      );

    case "pie": {
      const dataKey = chart.series[0]?.dataKey ?? "value";
      return (
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Legend content={<ChartLegendContent />} />
          <Pie data={chart.data} dataKey={dataKey} nameKey={chart.xAxisKey} cx="50%" cy="50%" outerRadius="70%" label>
            {chart.data.map((row, i) => (
              <Cell
                key={String(row[chart.xAxisKey])}
                fill={typeof row.color === "string" ? row.color : DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
              />
            ))}
          </Pie>
        </PieChart>
      );
    }

    case "radar":
      return (
        <RadarChart data={chart.data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey={chart.xAxisKey} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {chart.series.map((s, i) => {
            const color = getSeriesColor(chart.series, i);
            return (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={2}
              />
            );
          })}
        </RadarChart>
      );

    default:
      return null;
  }
}

export function AssistantChartArtifact({ chart }: { chart: ChartSpec }) {
  const config = buildConfig(chart);

  return (
    <div className="w-full space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{chart.title}</h4>
        {chart.description ? (
          <p className="text-xs text-muted-foreground">{chart.description}</p>
        ) : null}
      </div>
      <ChartContainer config={config} className="min-h-[280px] w-full">
        {renderChart(chart)}
      </ChartContainer>
    </div>
  );
}
