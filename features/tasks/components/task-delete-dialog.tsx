"use client";

import type { Task } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import {
  deleteTaskAction,
  type DeleteTaskActionState,
} from "@/features/tasks/server/task.actions";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { useToastMessage } from "@/shared/hooks/use-toast-message";

type TaskDeleteDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDeleteDialog({
  task,
  open,
  onOpenChange,
}: TaskDeleteDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    DeleteTaskActionState,
    FormData
  >(deleteTaskAction, {});

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
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
            <p>You are about to delete {task.title}.</p>
            <p>This action cannot be undone.</p>
          </div>
        }
        confirmText={"Delete"}
      />
    </>
  );
}
