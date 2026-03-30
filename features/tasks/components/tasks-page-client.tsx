"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import type { TaskTableSearchParams } from "@/features/tasks/schemas/task-table-params";
import type { Task } from "@/features/tasks/types/task.types";
import { TaskCreateDrawer } from "@/features/tasks/components/task-create-drawer";
import { TaskUpdateDrawer } from "@/features/tasks/components/task-update-drawer";
import { TasksDeleteDialog } from "@/features/tasks/components/tasks-delete-dialog";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { Button } from "@/shared/components/ui/button";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page";

type TasksDialogType = "create" | "update" | "delete";

type TasksPageClientProps = {
  tasksPage: TaskTableSearchParams & {
    rows: Task[];
    rowCount: number;
    pageCount: number;
  };
};

export function TasksPageClient({ tasksPage }: TasksPageClientProps) {
  const [dialog, setDialog] = useState<TasksDialogType | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const clearTaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (clearTaskTimeoutRef.current)
        clearTimeout(clearTaskTimeoutRef.current);
    };
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    if (clearTaskTimeoutRef.current)
      clearTimeout(clearTaskTimeoutRef.current);
    clearTaskTimeoutRef.current = setTimeout(() => {
      setCurrentTask(null);
      clearTaskTimeoutRef.current = null;
    }, 300);
  }, []);

  const openDialog = useCallback(
    (type: TasksDialogType, task: Task | null = null) => {
      if (clearTaskTimeoutRef.current) {
        clearTimeout(clearTaskTimeoutRef.current);
        clearTaskTimeoutRef.current = null;
      }
      setCurrentTask(task);
      setDialog(type);
    },
    [],
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog],
  );

  return (
    <>
      <Page>
        <PageHeader>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>
            Here&apos;s a list of your tasks for this month!
          </PageDescription>
          <PageHeaderActions>
            <Button
              className="space-x-1"
              onClick={() => openDialog("create")}
            >
              <span>Create</span>
              <Plus size={18} />
            </Button>
          </PageHeaderActions>
        </PageHeader>
        <TasksTable
          tasksPage={tasksPage}
          onEditTask={(task) => openDialog("update", task)}
          onDeleteTask={(task) => openDialog("delete", task)}
        />
      </Page>

      <TaskCreateDrawer
        open={dialog === "create"}
        onOpenChange={handleDialogOpenChange}
      />
      {currentTask && (
        <TaskUpdateDrawer
          key={currentTask.id}
          task={currentTask}
          open={dialog === "update"}
          onOpenChange={handleDialogOpenChange}
        />
      )}
      {currentTask && (
        <TasksDeleteDialog
          task={currentTask}
          open={dialog === "delete"}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </>
  );
}
