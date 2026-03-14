"use client";

import { TaskCreateDrawer } from './TaskCreateDrawer';
import { TasksDeleteDialog } from './TasksDeleteDialog';
import { useTasks } from './TasksProvider';
import { TaskUpdateDrawer } from './TaskUpdateDrawer';

export function TasksDialogs() {
  const { closeDialog, currentTask, dialog } = useTasks();

  return (
    <>
      <TaskCreateDrawer
        open={dialog === 'create'}
        onOpenChange={(open) => !open && closeDialog()}
      />

      {currentTask ? (
        <TaskUpdateDrawer
          key={currentTask.id}
          task={currentTask}
          open={dialog === 'update'}
          onOpenChange={(open) => !open && closeDialog()}
        />
      ) : null}

      {currentTask ? (
        <TasksDeleteDialog
          task={currentTask}
          open={dialog === 'delete'}
          onOpenChange={(open) => !open && closeDialog()}
        />
      ) : null}
    </>
  );
}
