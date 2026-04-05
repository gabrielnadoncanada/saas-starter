import type { Task } from "@prisma/client";
import Link from "next/link";

import { routes } from "@/shared/constants/routes";

export async function DashboardRecentTasks({ tasks }: { tasks: Task[] }) {
  

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tasks yet. Create one to start shaping the workspace.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={routes.app.tasks}
          className="block rounded-lg border p-3 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.code} · {task.status}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {task.priority}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
