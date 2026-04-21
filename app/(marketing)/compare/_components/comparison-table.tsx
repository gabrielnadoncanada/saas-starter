import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ComparisonCell, ComparisonFeatureRow } from "../_data/comparisons";

function Cell({ value, emphasize }: { value: ComparisonCell; emphasize?: boolean }) {
  if (value === true) {
    return (
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full",
          emphasize ? "bg-brand/15 text-brand" : "bg-muted text-foreground",
        )}
        aria-label="Included"
      >
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        className="inline-flex size-6 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
        aria-label="Not included"
      >
        <Minus className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-sm",
        emphasize ? "font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function ComparisonTable({
  rows,
  competitor,
}: {
  rows: ComparisonFeatureRow[];
  competitor: string;
}) {
  return (
    <div className="overflow-x-auto rounded-none border border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">
              Feature
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-brand">
              Tenviq
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.feature}
              className="border-b border-border/70 last:border-b-0"
            >
              <td className="px-4 py-3 text-foreground">{row.feature}</td>
              <td className="px-4 py-3">
                <Cell value={row.tenviq} emphasize />
              </td>
              <td className="px-4 py-3">
                <Cell value={row.competitor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
