"use client";

import type { Task } from "@prisma/client";
import { format } from "date-fns";
import { ClipboardList, MoreHorizontal, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { TaskDeleteDialog } from "@/features/tasks/components/task-delete-dialog";
import { TaskFormSheet } from "@/features/tasks/components/task-form-sheet";
import {
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "@/features/tasks/task-display";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type TasksDialog = "create" | "update" | "delete" | null;

type TasksPageProps = {
  tasks: Task[];
};

function getTaskLabel(value: Task["label"]) {
  return taskLabels.find((option) => option.value === value);
}

function getTaskPriority(value: Task["priority"]) {
  return taskPriorities.find((option) => option.value === value);
}

function getTaskStatus(value: Task["status"]) {
  return taskStatuses.find((option) => option.value === value);
}

function formatUpdatedAt(updatedAt: Task["updatedAt"]) {
  return format(new Date(updatedAt), "MMM d, yyyy");
}

function TaskRowActions({
  task,
  onEditTask,
  onDeleteTask,
}: {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open task actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditTask(task)}>
          Edit task
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDeleteTask(task)}
        >
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TasksPage({ tasks }: TasksPageProps) {
  const [dialog, setDialog] = useState<TasksDialog>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setCurrentTask(null);
  }, []);

  const openDialog = useCallback(
    (nextDialog: Exclude<TasksDialog, null>, task: Task | null = null) => {
      setCurrentTask(task);
      setDialog(nextDialog);
    },
    [],
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  return (
    <>
      <Page>
        <PageHeader>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>
            Create, update, and delete tasks for the current organization.
          </PageDescription>
          <PageHeaderActions>
            <Button className="space-x-1" onClick={() => openDialog("create")}>
              <span>Create</span>
              <Plus size={18} />
            </Button>
          </PageHeaderActions>
        </PageHeader>

        {tasks.length === 0 ? (
          <Empty className="rounded-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No tasks yet</EmptyTitle>
              <EmptyDescription>
                Create your first task to start tracking work for this
                organization.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => openDialog("create")}>
                Create your first task
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border p-0.5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-16 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const label = getTaskLabel(task.label);
                    const priority = getTaskPriority(task.priority);
                    const status = getTaskStatus(task.status);

                    return (
                      <TableRow key={task.id}>
                        <TableCell className="whitespace-normal">
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              {task.code}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{task.title}</p>
                              {label ? (
                                <Badge variant="outline">{label.label}</Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {task.description || "No description"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {status ? (
                            <div className="flex items-center gap-2">
                              <status.icon className="size-4 text-muted-foreground" />
                              <span>{status.label}</span>
                            </div>
                          ) : (
                            task.status
                          )}
                        </TableCell>
                        <TableCell>
                          {priority ? (
                            <div className="flex items-center gap-2">
                              <priority.icon className="size-4 text-muted-foreground" />
                              <span>{priority.label}</span>
                            </div>
                          ) : (
                            task.priority
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatUpdatedAt(task.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <TaskRowActions
                            task={task}
                            onEditTask={(nextTask) =>
                              openDialog("update", nextTask)
                            }
                            onDeleteTask={(nextTask) =>
                              openDialog("delete", nextTask)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
            </p>
          </div>
        )}
      </Page>

      <TaskFormSheet
        open={dialog === "create"}
        onOpenChange={handleDialogOpenChange}
      />

      {currentTask ? (
        <TaskFormSheet
          task={currentTask}
          open={dialog === "update"}
          onOpenChange={handleDialogOpenChange}
        />
      ) : null}

      {currentTask ? (
        <TaskDeleteDialog
          task={currentTask}
          open={dialog === "delete"}
          onOpenChange={handleDialogOpenChange}
        />
      ) : null}
    </>
  );
}
