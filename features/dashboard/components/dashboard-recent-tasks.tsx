import type { Task } from "@prisma/client";
import Link from "next/link";

import { taskPriorities, taskStatuses } from "@/features/tasks/task.schema";
import { Badge } from "@/shared/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/shared/components/ui/item";
import { routes } from "@/shared/constants/routes";

function getTaskStatusLabel(task: Task) {
  return taskStatuses.find((status) => status.value === task.status)?.label;
}

function getTaskPriorityLabel(task: Task) {
  return taskPriorities.find((priority) => priority.value === task.priority)
    ?.label;
}

export function DashboardRecentTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <Empty className="min-h-0 border">
        <EmptyHeader>
          <EmptyTitle>No tasks yet</EmptyTitle>
          <EmptyDescription>
            Create one to start shaping the workspace.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-3">
      {tasks.map((task) => (
        <Item key={task.id} asChild variant="outline">
          <Link href={routes.app.tasks}>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>{task.title}</ItemTitle>
                <ItemActions>
                  <Badge variant="outline">
                    {getTaskPriorityLabel(task) ?? task.priority}
                  </Badge>
                </ItemActions>
              </ItemHeader>
              <ItemDescription>
                {task.code} · {getTaskStatusLabel(task) ?? task.status}
              </ItemDescription>
            </ItemContent>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  );
}
