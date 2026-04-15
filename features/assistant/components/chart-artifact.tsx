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

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartSpec } from "@/features/assistant/types";

const DEFAULT_PALETTE = [
  "hsl(var(--brand-hsl))",
  "hsl(var(--brand-hsl) / 0.7)",
  "hsl(var(--brand-hsl) / 0.45)",
  "hsl(215 25% 55%)",
  "hsl(160 55% 42%)",
  "hsl(260 50% 58%)",
  "hsl(40 85% 55%)",
  "hsl(340 70% 55%)",
];

function getSeriesColor(series: ChartSpec["series"], index: number): string {
  return (
    series[index]?.color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]
  );
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

function BarChartRenderer({
  chart,
  config,
}: {
  chart: ChartSpec;
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="min-h-[280px] w-full">
      <BarChart data={chart.data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px]"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px] tabular-nums"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            fill={getSeriesColor(chart.series, i)}
            radius={0}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function LineChartRenderer({
  chart,
  config,
}: {
  chart: ChartSpec;
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="min-h-[280px] w-full">
      <LineChart data={chart.data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px]"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px] tabular-nums"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.series.map((s, i) => (
          <Line
            key={s.dataKey}
            dataKey={s.dataKey}
            type="monotone"
            stroke={getSeriesColor(chart.series, i)}
            strokeWidth={1.75}
            dot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

function AreaChartRenderer({
  chart,
  config,
}: {
  chart: ChartSpec;
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="min-h-[280px] w-full">
      <AreaChart data={chart.data} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="2 4" />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px]"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="font-mono text-[10px] tabular-nums"
        />
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
              fillOpacity={0.18}
              strokeWidth={1.75}
            />
          );
        })}
      </AreaChart>
    </ChartContainer>
  );
}

function PieChartRenderer({
  chart,
  config,
}: {
  chart: ChartSpec;
  config: ChartConfig;
}) {
  const dataKey = chart.series[0]?.dataKey ?? "value";

  return (
    <ChartContainer config={config} className="min-h-[280px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Legend content={<ChartLegendContent />} />
        <Pie
          data={chart.data}
          dataKey={dataKey}
          nameKey={chart.xAxisKey}
          cx="50%"
          cy="50%"
          outerRadius="70%"
          label
          stroke="hsl(var(--background))"
          strokeWidth={2}
        >
          {chart.data.map((row, i) => (
            <Cell
              key={String(row[chart.xAxisKey])}
              fill={DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

function RadarChartRenderer({
  chart,
  config,
}: {
  chart: ChartSpec;
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="min-h-[280px] w-full">
      <RadarChart data={chart.data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis
          dataKey={chart.xAxisKey}
          className="font-mono text-[10px]"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.series.map((s, i) => {
          const color = getSeriesColor(chart.series, i);
          return (
            <Radar
              key={s.dataKey}
              dataKey={s.dataKey}
              fill={color}
              fillOpacity={0.18}
              stroke={color}
              strokeWidth={1.75}
            />
          );
        })}
      </RadarChart>
    </ChartContainer>
  );
}

const renderers: Record<
  ChartSpec["type"],
  React.ComponentType<{ chart: ChartSpec; config: ChartConfig }>
> = {
  bar: BarChartRenderer,
  line: LineChartRenderer,
  area: AreaChartRenderer,
  pie: PieChartRenderer,
  radar: RadarChartRenderer,
};

export function AssistantChartArtifact({ chart }: { chart: ChartSpec }) {
  const config = buildConfig(chart);
  const Renderer = renderers[chart.type] ?? BarChartRenderer;

  return (
    <div className="w-full border border-border bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0 space-y-1">
          <span className="label-mono block">
            {chart.type} chart · artifact
          </span>
          <h4 className="truncate text-sm font-semibold tracking-[-0.01em]">
            {chart.title}
          </h4>
          {chart.description ? (
            <p className="text-xs text-muted-foreground">{chart.description}</p>
          ) : null}
        </div>
        <span
          aria-hidden
          className="mt-1 block size-2 shrink-0 bg-brand"
        />
      </div>
      <div className="p-4">
        <Renderer chart={chart} config={config} />
      </div>
    </div>
  );
}
