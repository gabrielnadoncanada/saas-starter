"use client";

import type { Task } from "@prisma/client";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { TaskDeleteDialog } from "@/features/tasks/components/task-delete-dialog";
import { TaskFormSheet } from "@/features/tasks/components/task-form-sheet";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import type { TaskTableSearchParams } from "@/features/tasks/task-schemas";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

type TasksDialog = "create" | "update" | "delete" | null;

type TasksPageProps = {
  tasksPage: TaskTableSearchParams & {
    rows: Task[];
    rowCount: number;
    pageCount: number;
  };
};

export function TasksPage({ tasksPage }: TasksPageProps) {
  const [dialog, setDialog] = useState<TasksDialog>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const clearTaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  const openDialog = useCallback(
    (nextDialog: Exclude<TasksDialog, null>, task: Task | null = null) => {
      if (clearTaskTimeoutRef.current) {
        clearTimeout(clearTaskTimeoutRef.current);
        clearTaskTimeoutRef.current = null;
      }

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
            Here&apos;s a list of your tasks for this month!
          </PageDescription>
          <PageHeaderActions>
            <Button className="space-x-1" onClick={() => openDialog("create")}>
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

      <TaskFormSheet
        mode="create"
        open={dialog === "create"}
        onOpenChange={handleDialogOpenChange}
      />

      {currentTask ? (
        <TaskFormSheet
          mode="update"
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
