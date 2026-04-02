"use client";

import type { Task } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { TaskForm } from "@/features/tasks/components/task-form";
import {
  createTaskAction,
  type CreateTaskActionState,
  updateTaskAction,
  type UpdateTaskActionState,
} from "@/features/tasks/server/task-server-actions";
import { useToastMessage } from "@/shared/hooks/useToastMessage";

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

    router.refresh();
    props.onOpenChange(false);
  }, [props, router, state.success]);

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
      task={props.task}
      state={state}
      formAction={formAction}
      isPending={isPending}
    />
  );
}
