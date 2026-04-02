import { CheckCircle2, Circle } from "lucide-react";

import { Link } from "@/shared/i18n/navigation";

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  href: string;
};

export function DashboardOnboardingChecklist({
  items,
}: {
  items: ChecklistItem[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
        >
          {item.done ? (
            <CheckCircle2 className="size-4 text-green-500" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
