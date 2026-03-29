"use client";

import { useCallback } from 'react';

import type { Task } from '../../types/task.types';
import { TaskCreateDrawer } from './task-create-drawer';
import { TasksDeleteDialog } from './tasks-delete-dialog';
import { TaskUpdateDrawer } from './task-update-drawer';

type TasksDialogType = 'create' | 'update' | 'delete';

type TasksDialogsProps = {
  currentTask: Task | null;
  dialog: TasksDialogType | null;
  onCloseDialog: () => void;
};

export function TasksDialogs({
  currentTask,
  dialog,
  onCloseDialog,
}: TasksDialogsProps) {
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onCloseDialog();
      }
    },
    [onCloseDialog]
  );

  return (
    <>
      <TaskCreateDrawer
        open={dialog === 'create'}
        onOpenChange={handleDialogOpenChange}
      />

      {currentTask ? (
        <TaskUpdateDrawer
          key={currentTask.id}
          task={currentTask}
          open={dialog === 'update'}
          onOpenChange={handleDialogOpenChange}
        />
      ) : null}

      {currentTask ? (
        <TasksDeleteDialog
          task={currentTask}
          open={dialog === 'delete'}
          onOpenChange={handleDialogOpenChange}
        />
      ) : null}
    </>
  );
}
