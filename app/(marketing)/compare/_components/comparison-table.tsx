import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ComparisonCell, ComparisonFeatureRow } from "../_data/comparisons";

function Cell({
  value,
  emphasize,
}: {
  value: ComparisonCell;
  emphasize?: boolean;
}) {
  if (value === true) {
    return (
      <span
        className={cn(
          "inline-flex size-5 items-center justify-center border",
          emphasize
            ? "border-brand bg-brand text-brand-foreground"
            : "border-border text-muted-foreground",
        )}
        aria-label="Included"
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className="inline-flex size-5 items-center justify-center text-muted-foreground/50"
        aria-label="Not included"
      >
        <Minus className="size-3.5" strokeWidth={2} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm leading-snug",
        emphasize ? "text-foreground" : "text-muted-foreground",
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
    <div className="overflow-x-auto border-y border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="py-5 pr-6 text-left font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
            >
              Feature
            </th>
            <th
              scope="col"
              className="w-[22%] py-5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-brand"
            >
              <span className="mr-2 inline-block size-1.5 bg-brand align-middle" aria-hidden />
              Tenviq
            </th>
            <th
              scope="col"
              className="w-[22%] py-5 pl-6 text-left font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
            >
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-border/60 last:border-b-0">
              <td className="py-4 pr-6 align-middle text-foreground">{row.feature}</td>
              <td className="py-4 align-middle">
                <Cell value={row.tenviq} emphasize />
              </td>
              <td className="py-4 pl-6 align-middle">
                <Cell value={row.competitor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
