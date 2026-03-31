"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { deleteTaskAction } from "@/features/tasks/actions/task.actions";
import type { DeleteTaskActionState } from "@/features/tasks/types/task-action.types";
import type { Task } from "@prisma/client";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";

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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    DeleteTaskActionState,
    FormData
  >(deleteTaskAction, {});

  useToastMessage(state.error, { kind: "error", skip: Boolean(state.fieldErrors), trigger: state });
  useToastMessage(state.success, { kind: "success", trigger: state });

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.success]);

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="taskId" value={task.id} />
      </form>

      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        destructive
        isLoading={isPending}
        handleConfirm={() => formRef.current?.requestSubmit()}
        className="max-w-md"
        title={`Delete ${task.code}?`}
        desc={
          <div className="space-y-3">
            <p>
              You are about to delete <strong>{task.title}</strong>.
            </p>
            <p>This action cannot be undone.</p>
          </div>
        }
        confirmText="Delete"
      />
    </>
  );
}
