"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TasksDialogs } from "@/features/tasks/components/dialogs/tasks-dialogs";
import { TasksPrimaryButtons } from "@/features/tasks/components/tasks-primary-buttons";
import { TasksTable } from "@/features/tasks/components/table/tasks-table";
import type { Task } from "@/features/tasks/types/task.types";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page";

type TasksDialogType = "create" | "update" | "delete";

type TasksPageClientProps = {
  initialTasks: Task[];
};

export function TasksPageClient({ initialTasks }: TasksPageClientProps) {
  const [dialog, setDialog] = useState<TasksDialogType | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const clearTaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTaskTimeoutRef.current) {
        clearTimeout(clearTaskTimeoutRef.current);
      }
    };
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);

    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
    }

    clearTaskTimeoutRef.current = setTimeout(() => {
      setCurrentTask(null);
      clearTaskTimeoutRef.current = null;
    }, 300);
  }, []);

  const openDialog = useCallback((nextDialog: TasksDialogType, task: Task | null = null) => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(task);
    setDialog(nextDialog);
  }, []);

  const openCreateDialog = useCallback(() => {
    openDialog("create");
  }, [openDialog]);

  const openDeleteDialog = useCallback((task: Task) => {
    openDialog("delete", task);
  }, [openDialog]);

  const openUpdateDialog = useCallback((task: Task) => {
    openDialog("update", task);
  }, [openDialog]);

  return (
    <>
      <Page>
        <PageHeader>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>Here&apos;s a list of your tasks for this month!</PageDescription>
          <PageHeaderActions>
            <TasksPrimaryButtons onCreateClick={openCreateDialog} />
          </PageHeaderActions>
        </PageHeader>
        <TasksTable
          tasks={initialTasks}
          onOpenDeleteDialog={openDeleteDialog}
          onOpenUpdateDialog={openUpdateDialog}
        />
      </Page>
      <TasksDialogs
        currentTask={currentTask}
        dialog={dialog}
        onCloseDialog={closeDialog}
      />
    </>
  );
}
