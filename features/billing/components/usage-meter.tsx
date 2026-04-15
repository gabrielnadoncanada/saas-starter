import { cn } from "@/lib/utils";

type UsageMeterProps = {
  label: string;
  current: number;
  limit: number;
};

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const percentage =
    limit === Infinity ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = percentage >= 80;
  const displayLimit = limit === Infinity ? "Unlimited" : limit;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-[11px] tabular-nums">
          <span className="font-semibold">{current}</span>
          <span className="text-muted-foreground"> / {displayLimit}</span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-[width]",
            isNearLimit ? "bg-destructive" : "bg-brand",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
