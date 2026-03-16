type UsageMeterProps = {
  label: string;
  current: number;
  limit: number;
};

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const percentage = limit === Infinity ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = percentage >= 80;
  const displayLimit = limit === Infinity ? "Unlimited" : limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {current} / {displayLimit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-orange-500" : "bg-primary"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
