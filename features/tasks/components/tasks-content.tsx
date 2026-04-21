"use client";

import type { Task } from "@prisma/client";
import { useState } from "react";

import { TaskDeleteDialog } from "@/features/tasks/components/task-delete-dialog";
import { TaskFormSheet } from "@/features/tasks/components/task-form-sheet";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import type { TaskTableSearchParams } from "@/features/tasks/task-table-search-params";

type TasksDialog = "update" | "delete" | null;

type TasksContentProps = {
  tasksPage: TaskTableSearchParams & {
    rows: Task[];
    rowCount: number;
    pageCount: number;
  };
};

export function TasksContent({ tasksPage }: TasksContentProps) {
  const [dialog, setDialog] = useState<TasksDialog>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  function openDialog(nextDialog: TasksDialog, task: Task): void {
    setCurrentTask(task);
    setDialog(nextDialog);
  }

  function handleDialogOpenChange(open: boolean): void {
    if (!open) {
      setDialog(null);
      setCurrentTask(null);
    }
  }

  return (
    <>
      <TasksTable
        tasksPage={tasksPage}
        onEditTask={(task) => openDialog("update", task)}
        onDeleteTask={(task) => openDialog("delete", task)}
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
