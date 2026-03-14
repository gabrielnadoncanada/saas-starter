"use client";

import { useActionState, useEffect, useRef } from 'react';

import { deleteTaskAction } from '@/features/tasks/actions/delete-task.action';
import type { Task } from '@/features/tasks/types/task.types';
import { ConfirmDialog } from '@/shared/components/dialogs/ConfirmDialog';

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
  const [state, formAction, isPending] = useActionState(deleteTaskAction, {});

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [onOpenChange, state.success]);

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
            {state.error ? <p className='text-sm text-destructive'>{state.error}</p> : null}
          </div>
        }
        confirmText='Delete'
      />
    </>
  );
}
