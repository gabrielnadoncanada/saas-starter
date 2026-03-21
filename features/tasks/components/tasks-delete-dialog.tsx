"use client";

import { useActionState, useEffect, useRef } from 'react';

import { deleteTaskAction } from '@/features/tasks/actions/delete-task.action';
import type { DeleteTaskActionState } from '@/features/tasks/types/task-action.types';
import type { Task } from '@/features/tasks/types/task.types';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { ConfirmDialog } from '@/shared/components/dialogs/confirm-dialog';
import { useTasks } from './tasks-provider';

type TasksDeleteDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TasksDeleteDialog({
  task,
  open,
  onOpenChange,
}: TasksDeleteDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { deleteTask } = useTasks();
  const [state, formAction, isPending] = useActionState<DeleteTaskActionState, FormData>(
    deleteTaskAction,
    {}
  );

  useFormActionToasts(state);

  useEffect(() => {
    if (state.taskId) {
      deleteTask(state.taskId);
    }

    if (state.success) {
      onOpenChange(false);
    }
  }, [deleteTask, onOpenChange, state.success, state.taskId]);

  return (
    <>
      <form ref={formRef} action={formAction} className='hidden'>
        <input type='hidden' name='taskId' value={task.id} />
      </form>

      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        destructive
        isLoading={isPending}
        handleConfirm={() => formRef.current?.requestSubmit()}
        className='max-w-md'
        title={`Delete ${task.code}?`}
        desc={
          <div className='space-y-3'>
            <p>
              You are about to delete <strong>{task.title}</strong>.
            </p>
            <p>This action cannot be undone.</p>
          </div>
        }
        confirmText='Delete'
      />
    </>
  );
}
