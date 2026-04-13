import type { Task } from "@prisma/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { routes } from "@/constants/routes";
import { taskPriorities, taskStatuses } from "@/features/tasks/task-display";

type DashboardRecentTasksCardProps = {
  tasks: Task[];
  workspaceName: string;
};

function RecentTasksList({ tasks }: { tasks: Task[] }) {
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
      {tasks.map((task) => {
        const statusLabel = taskStatuses.find(
          (status) => status.value === task.status,
        )?.label;
        const priorityLabel = taskPriorities.find(
          (priority) => priority.value === task.priority,
        )?.label;

        return (
          <Item key={task.id} asChild variant="outline">
            <Link href={routes.app.tasks}>
              <ItemContent>
                <ItemHeader>
                  <ItemTitle>{task.title}</ItemTitle>
                  <ItemActions>
                    <Badge variant="outline">
                      {priorityLabel ?? task.priority}
                    </Badge>
                  </ItemActions>
                </ItemHeader>
                <ItemDescription>
                  {task.code} · {statusLabel ?? task.status}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

export function DashboardRecentTasksCard({
  tasks,
  workspaceName,
}: DashboardRecentTasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent tasks</CardTitle>
        <CardDescription>
          {`The latest task work happening in ${workspaceName}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecentTasksList tasks={tasks} />
      </CardContent>
    </Card>
  );
}
