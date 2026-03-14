"use client";

import { TaskCreateDrawer } from './TaskCreateDrawer';
import { TasksDeleteDialog } from './TasksDeleteDialog';
import { useTasks } from './TasksProvider';
import { TaskUpdateDrawer } from './TaskUpdateDrawer';

export function TasksDialogs() {
  const { closeDialog, currentTask, dialog } = useTasks();

  return (
    <>
      {dialog === 'create' ? (
        <TaskCreateDrawer open onOpenChange={(open) => !open && closeDialog()} />
      ) : null}

      {dialog === 'update' && currentTask ? (
        <TaskUpdateDrawer
          key={currentTask.id}
          task={currentTask}
          open
          onOpenChange={(open) => !open && closeDialog()}
        />
      ) : null}

      {dialog === 'delete' && currentTask ? (
        <TasksDeleteDialog
          task={currentTask}
          open
          onOpenChange={(open) => !open && closeDialog()}
        />
      ) : null}
    </>
  );
}
