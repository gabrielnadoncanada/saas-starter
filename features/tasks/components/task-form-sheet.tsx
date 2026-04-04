"use client";

import type { Task } from "@prisma/client";
import { useActionState, useEffect, useRef } from "react";

import { TaskAttachmentsPanel } from "@/features/tasks/components/task-attachments-panel";
import { TaskForm } from "@/features/tasks/components/task-form";
import {
  createTaskAction,
  type CreateTaskActionState,
  updateTaskAction,
  type UpdateTaskActionState,
} from "@/features/tasks/server/task.actions";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { useRouter } from "@/shared/i18n/navigation";

type CreateTaskFormSheetProps = {
  mode: "create";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type UpdateTaskFormSheetProps = {
  mode: "update";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
};

type TaskFormSheetProps = CreateTaskFormSheetProps | UpdateTaskFormSheetProps;

export function TaskFormSheet(props: TaskFormSheetProps) {
  const router = useRouter();
  const { onOpenChange } = props;
  const lastHandledStateRef = useRef<
    CreateTaskActionState | UpdateTaskActionState | null
  >(null);
  const createState = useActionState<CreateTaskActionState, FormData>(
    createTaskAction,
    {},
  );
  const updateState = useActionState<UpdateTaskActionState, FormData>(
    updateTaskAction,
    {},
  );
  const [state, formAction, isPending] =
    props.mode === "create" ? createState : updateState;

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, { kind: "success", trigger: state });

  useEffect(() => {
    if (!state.success) {
      return;
    }

    if (lastHandledStateRef.current === state) {
      return;
    }

    lastHandledStateRef.current = state;
    router.refresh();
    onOpenChange(false);
  }, [onOpenChange, router, state]);

  return props.mode === "create" ? (
    <TaskForm
      mode="create"
      open={props.open}
      onOpenChange={props.onOpenChange}
      state={state}
      formAction={formAction}
      isPending={isPending}
    />
  ) : (
    <TaskForm
      mode="update"
      open={props.open}
      onOpenChange={props.onOpenChange}
      attachmentsSlot={<TaskAttachmentsPanel taskId={props.task.id} />}
      task={props.task}
      state={state}
      formAction={formAction}
      isPending={isPending}
    />
  );
}

