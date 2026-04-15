import type { AdminPlanSlice } from "@/features/admin/server/get-admin-overview";
import { cn } from "@/lib/utils";

type AdminPlanBreakdownProps = {
  slices: AdminPlanSlice[];
  totalOrganizations: number;
};

export function AdminPlanBreakdown({
  slices,
  totalOrganizations,
}: AdminPlanBreakdownProps) {
  const paidCount = slices
    .filter((s) => s.planId !== "free")
    .reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="label-mono">Plan distribution</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em]">
            {paidCount}
            <span className="ml-1.5 font-mono text-xs font-normal tabular-nums text-muted-foreground">
              / {totalOrganizations} paying
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-5">
        {slices.map((slice, index) => (
          <PlanRow
            key={slice.planId}
            slice={slice}
            highlight={slice.planId !== "free" && index === 1}
          />
        ))}
        {slices.length === 0 ? (
          <p className="label-mono">
            No organizations yet
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PlanRow({
  slice,
  highlight,
}: {
  slice: AdminPlanSlice;
  highlight: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "size-1.5",
              slice.planId === "free"
                ? "bg-muted-foreground/50"
                : highlight
                  ? "bg-brand"
                  : "bg-brand/60",
            )}
          />
          <span className="text-sm font-medium">{slice.planName}</span>
        </span>
        <p className="font-mono text-[11px] tabular-nums">
          <span className="font-semibold">{slice.count}</span>
          <span className="text-muted-foreground"> · {slice.percent}%</span>
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-[width]",
            slice.planId === "free" ? "bg-muted-foreground/40" : "bg-brand",
          )}
          style={{ width: `${Math.max(2, slice.percent)}%` }}
        />
      </div>
    </div>
  );
}
