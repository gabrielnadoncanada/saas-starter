"use client";

import type { Task } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { updateTaskAction } from "@/features/tasks/actions/task.actions";
import {
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "@/features/tasks/task-display";
import type { UpdateTaskValues } from "@/features/tasks/task.schema";
import { UpgradePrompt } from "@/shared/components/billing/upgrade-prompt";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastMessage } from "@/shared/hooks/use-toast-message";
import type { FormActionState } from "@/shared/types/form-action-state";

type UpdateTaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
};

export function UpdateTaskForm({
  open,
  onOpenChange,
  task,
}: UpdateTaskFormProps) {
  const router = useRouter();
  const lastHandledStateRef = useRef<FormActionState<UpdateTaskValues> | null>(
    null,
  );
  const [state, formAction, isPending] = useActionState<
    FormActionState<UpdateTaskValues>,
    FormData
  >(updateTaskAction, {});

  const isBillingError = Boolean(state.errorCode);

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors) || isBillingError,
    trigger: state,
  });
  useToastMessage(state.success, { kind: "success", trigger: state });

  useEffect(() => {
    if (!state.success || lastHandledStateRef.current === state) return;
    lastHandledStateRef.current = state;
    router.refresh();
    onOpenChange(false);
  }, [onOpenChange, router, state]);

  const titleError = state.fieldErrors?.title?.[0];
  const descriptionError = state.fieldErrors?.description?.[0];
  const labelError = state.fieldErrors?.label?.[0];
  const priorityError = state.fieldErrors?.priority?.[0];
  const statusError = state.fieldErrors?.status?.[0];

  const titleValue = String(state.values?.title ?? task.title);
  const descriptionValue = String(state.values?.description ?? task.description ?? "");
  const labelValue = String(state.values?.label ?? task.label);
  const priorityValue = String(state.values?.priority ?? task.priority);
  const statusValue = String(state.values?.status ?? task.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>Update Task</SheetTitle>
          <SheetDescription>
            Edit {task.code} for the current organization.
          </SheetDescription>
        </SheetHeader>

        <form
          action={formAction}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4"
        >
          <input type="hidden" name="taskId" value={task.id} />

          <UpgradePrompt errorCode={state.errorCode} message={state.error} />

          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(titleError)}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                name="title"
                defaultValue={titleValue}
                placeholder="Ship the onboarding polish"
                aria-invalid={Boolean(titleError)}
                required
              />
              <FieldError>{titleError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(descriptionError)}>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                name="description"
                defaultValue={descriptionValue}
                placeholder="Optional context for the task"
                aria-invalid={Boolean(descriptionError)}
              />
              <FieldError>{descriptionError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(labelError)}>
              <FieldLabel htmlFor="task-label">Label</FieldLabel>
              <Select name="label" defaultValue={labelValue}>
                <SelectTrigger
                  id="task-label"
                  className="w-full"
                  aria-invalid={Boolean(labelError)}
                >
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  {taskLabels.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{labelError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(priorityError)}>
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <Select name="priority" defaultValue={priorityValue}>
                <SelectTrigger
                  id="task-priority"
                  className="w-full"
                  aria-invalid={Boolean(priorityError)}
                >
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorities.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{priorityError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(statusError)}>
              <FieldLabel htmlFor="task-status">Status</FieldLabel>
              <Select name="status" defaultValue={statusValue}>
                <SelectTrigger
                  id="task-status"
                  className="w-full"
                  aria-invalid={Boolean(statusError)}
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{statusError}</FieldError>
            </Field>
          </FieldGroup>

          <SheetFooter className="mt-auto gap-2 px-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
