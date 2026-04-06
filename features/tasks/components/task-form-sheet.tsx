"use client";

import type { Task } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { TaskForm } from "@/features/tasks/components/task-form";
import {
  createTaskAction,
  type CreateTaskActionState,
  updateTaskAction,
} from "@/features/tasks/actions/task.actions";
import type { UpdateTaskValues } from "@/features/tasks/task-form.schema";
import { UpgradePrompt } from "@/shared/components/billing/upgrade-prompt";
import { useToastMessage } from "@/shared/hooks/use-toast-message";
import type { FormActionState } from "@/shared/types/form-action-state";

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
    CreateTaskActionState | FormActionState<UpdateTaskValues> | null
  >(null);

  const createState = useActionState<CreateTaskActionState, FormData>(
    createTaskAction,
    {},
  );
  const updateState = useActionState<FormActionState<UpdateTaskValues>, FormData>(
    updateTaskAction,
    {},
  );
  const [state, formAction, isPending] =
    props.mode === "create" ? createState : updateState;

  const isBillingError = Boolean(state.errorCode);

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors) || isBillingError,
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

  const upgradePrompt = (
    <UpgradePrompt errorCode={state.errorCode} message={state.error} />
  );

  return props.mode === "create" ? (
    <TaskForm
      mode="create"
      open={props.open}
      onOpenChange={props.onOpenChange}
      state={state}
      formAction={formAction}
      isPending={isPending}
      banner={upgradePrompt}
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
