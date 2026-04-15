import { formatDistanceToNowStrict } from "date-fns";
import { CheckCircle2, MessageSquare, UserPlus2 } from "lucide-react";
import Link from "next/link";

import { routes } from "@/constants/routes";
import type { ActivityFeedItem } from "@/features/dashboard/server/get-dashboard-overview";
import { taskStatuses } from "@/features/tasks/task-display";
import type { TaskStatus } from "@/lib/db/enums";

type DashboardActivityFeedProps = {
  items: ActivityFeedItem[];
};

export function DashboardActivityFeed({ items }: DashboardActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col border border-border bg-card">
        <Header />
        <div className="flex flex-1 items-center justify-center p-10">
          <p className="max-w-[20ch] text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No activity in the last 14 days
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      <Header />
      <ol className="flex-1 divide-y divide-border">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <ActivityRow item={item} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Activity · Last 14 days
      </p>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const timeAgo = formatDistanceToNowStrict(item.at, { addSuffix: false });

  if (item.kind === "task.created") {
    const statusLabel =
      taskStatuses.find((s) => s.value === (item.status as TaskStatus))
        ?.label ?? item.status;
    return (
      <Link
        href={routes.app.tasks}
        className="group relative flex items-start gap-4 px-5 py-3 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-transparent before:transition-colors before:content-[''] hover:before:bg-brand"
      >
        <IconBadge>
          <CheckCircle2 className="size-3.5" strokeWidth={2.25} />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm">
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.code}
              </span>{" "}
              <span className="font-medium text-foreground group-hover:text-brand">
                {item.title}
              </span>
            </p>
            <TimeStamp value={timeAgo} />
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Task · {statusLabel}
          </p>
        </div>
      </Link>
    );
  }

  if (item.kind === "ai.conversation") {
    return (
      <Link
        href={routes.app.assistant}
        className="group relative flex items-start gap-4 px-5 py-3 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-transparent before:transition-colors before:content-[''] hover:before:bg-brand"
      >
        <IconBadge tone="brand">
          <MessageSquare className="size-3.5" strokeWidth={2.25} />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-medium group-hover:text-brand">
              {item.title}
            </p>
            <TimeStamp value={timeAgo} />
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            AI · {item.surface}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={routes.settings.members}
      className="group flex items-start gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
    >
      <IconBadge>
        <UserPlus2 className="size-3.5" strokeWidth={2.25} />
      </IconBadge>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-medium group-hover:text-brand">
            {item.name}
          </p>
          <TimeStamp value={timeAgo} />
        </div>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Joined · {item.role}
        </p>
      </div>
    </Link>
  );
}

function IconBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  return (
    <span
      className={
        tone === "brand"
          ? "mt-0.5 flex size-6 shrink-0 items-center justify-center border border-brand/30 bg-brand/10 text-brand"
          : "mt-0.5 flex size-6 shrink-0 items-center justify-center border border-border bg-background text-muted-foreground"
      }
    >
      {children}
    </span>
  );
}

function TimeStamp({ value }: { value: string }) {
  return (
    <span className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      {value}
    </span>
  );
}
