"use client";

type ChartTooltipEntry = {
  name?: string;
  value?: number;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
};

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-border bg-popover px-3 py-2">
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
