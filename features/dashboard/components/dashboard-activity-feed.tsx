type ActivityItem = {
  id: string;
  summary: string;
  createdAt: Date;
  actor: {
    name: string | null;
    email: string;
  } | null;
};

export function DashboardActivityFeed({
  activity,
}: {
  activity: ActivityItem[];
}) {
  if (activity.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Activity will appear here as your team uses the starter.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activity.map((item) => (
        <div key={item.id} className="rounded-lg border p-3">
          <p className="text-sm font-medium">{item.summary}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(item.actor?.name || item.actor?.email || "Someone") +
              " · " +
              item.createdAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
          </p>
        </div>
      ))}
    </div>
  );
}
