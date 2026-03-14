"use client";

import { useCallback } from 'react';

import { TaskCreateDrawer } from './TaskCreateDrawer';
import { TasksDeleteDialog } from './TasksDeleteDialog';
import { useTasks } from './TasksProvider';
import { TaskUpdateDrawer } from './TaskUpdateDrawer';

export function TasksDialogs() {
  const { closeDialog, currentTask, dialog } = useTasks();
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog]
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
