import { formatDistanceToNowStrict } from "date-fns";
import { Building2, UserPlus2 } from "lucide-react";

import type { AdminRecentItem } from "@/features/admin/server/get-admin-overview";

export function AdminRecentActivity({ items }: { items: AdminRecentItem[] }) {
  return (
    <div className="flex h-full flex-col border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <p className="label-mono">Recent activity</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-10">
          <p className="max-w-[22ch] text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No signups or new orgs yet
          </p>
        </div>
      ) : (
        <ol className="flex-1 divide-y divide-border">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <ActivityRow item={item} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ActivityRow({ item }: { item: AdminRecentItem }) {
  const timeAgo = formatDistanceToNowStrict(item.at, { addSuffix: false });

  if (item.kind === "user.signup") {
    return (
      <div className="flex items-start gap-4 px-5 py-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-border bg-background text-muted-foreground">
          <UserPlus2 className="size-3.5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-medium">
              {item.name ?? item.email}
            </p>
            <Time value={timeAgo} />
          </div>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Signup · {item.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 px-5 py-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-brand/30 bg-brand/10 text-brand">
        <Building2 className="size-3.5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <Time value={timeAgo} />
        </div>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          New org{item.slug ? ` · ${item.slug}` : ""}
        </p>
      </div>
    </div>
  );
}

function Time({ value }: { value: string }) {
  return (
    <span className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {value}
    </span>
  );
}
