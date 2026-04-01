"use client";

import type { Task } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  createTaskAction,
  updateTaskAction,
} from "@/features/tasks/server/task-actions";
import {
  CreateTaskActionState,
  UpdateTaskActionState,
} from "@/features/tasks/server/task-action-state";
import {
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "@/features/tasks/task-options";
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
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { getFieldState } from "@/shared/lib/get-field-state";

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

type CreateTaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type UpdateTaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
};

function CreateTaskForm({ open, onOpenChange }: CreateTaskFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    CreateTaskActionState,
    FormData
  >(createTaskAction, {});

  const titleField = getFieldState(state, "title");
  const descriptionField = getFieldState(state, "description");
  const labelField = getFieldState(state, "label");
  const priorityField = getFieldState(state, "priority");

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, {
    kind: "success",
    trigger: state,
  });

  useEffect(() => {
    if (!state.success) {
      return;
    }

    router.refresh();
    onOpenChange(false);
  }, [onOpenChange, router, state.success]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>Create Task</SheetTitle>
          <SheetDescription>
            Add a task for the current organization.
          </SheetDescription>
        </SheetHeader>

        <form
          action={formAction}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4"
        >
          <FieldGroup className="gap-4">
            <Field data-invalid={titleField.invalid}>
              <FieldLabel htmlFor="create-task-title">Title</FieldLabel>
              <Input
                id="create-task-title"
                name="title"
                defaultValue={state.values?.title ?? ""}
                placeholder="Ship the onboarding polish"
                aria-invalid={titleField.invalid}
                required
              />
              <FieldError>{titleField.error}</FieldError>
            </Field>

            <Field data-invalid={descriptionField.invalid}>
              <FieldLabel htmlFor="create-task-description">
                Description
              </FieldLabel>
              <Textarea
                id="create-task-description"
                name="description"
                defaultValue={state.values?.description ?? ""}
                placeholder="Optional context for the task"
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor="create-task-label">Label</FieldLabel>
              <Select
                name="label"
                defaultValue={state.values?.label ?? "FEATURE"}
              >
                <SelectTrigger
                  id="create-task-label"
                  className="w-full"
                  aria-invalid={labelField.invalid}
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
              <FieldError>{labelField.error}</FieldError>
            </Field>

            <Field data-invalid={priorityField.invalid}>
              <FieldLabel htmlFor="create-task-priority">Priority</FieldLabel>
              <Select
                name="priority"
                defaultValue={state.values?.priority ?? "MEDIUM"}
              >
                <SelectTrigger
                  id="create-task-priority"
                  className="w-full"
                  aria-invalid={priorityField.invalid}
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
              <FieldError>{priorityField.error}</FieldError>
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
                "Create Task"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function UpdateTaskForm({ open, onOpenChange, task }: UpdateTaskFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    UpdateTaskActionState,
    FormData
  >(updateTaskAction, {});

  const titleField = getFieldState(state, "title");
  const descriptionField = getFieldState(state, "description");
  const labelField = getFieldState(state, "label");
  const priorityField = getFieldState(state, "priority");
  const statusField = getFieldState(state, "status");

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, {
    kind: "success",
    trigger: state,
  });

  useEffect(() => {
    if (!state.success) {
      return;
    }

    router.refresh();
    onOpenChange(false);
  }, [onOpenChange, router, state.success]);

  const title = state.values?.title ?? task.title;
  const description = state.values?.description ?? task.description ?? "";
  const label = state.values?.label ?? task.label;
  const priority = state.values?.priority ?? task.priority;
  const status = state.values?.status ?? task.status;

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

          <FieldGroup className="gap-4">
            <Field data-invalid={titleField.invalid}>
              <FieldLabel htmlFor={`task-title-${task.id}`}>Title</FieldLabel>
              <Input
                id={`task-title-${task.id}`}
                name="title"
                defaultValue={title}
                placeholder="Ship the onboarding polish"
                aria-invalid={titleField.invalid}
                required
              />
              <FieldError>{titleField.error}</FieldError>
            </Field>

            <Field data-invalid={descriptionField.invalid}>
              <FieldLabel htmlFor={`task-description-${task.id}`}>
                Description
              </FieldLabel>
              <Textarea
                id={`task-description-${task.id}`}
                name="description"
                defaultValue={description}
                placeholder="Optional context for the task"
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor={`task-label-${task.id}`}>Label</FieldLabel>
              <Select name="label" defaultValue={label}>
                <SelectTrigger
                  id={`task-label-${task.id}`}
                  className="w-full"
                  aria-invalid={labelField.invalid}
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
              <FieldError>{labelField.error}</FieldError>
            </Field>

            <Field data-invalid={priorityField.invalid}>
              <FieldLabel htmlFor={`task-priority-${task.id}`}>
                Priority
              </FieldLabel>
              <Select name="priority" defaultValue={priority}>
                <SelectTrigger
                  id={`task-priority-${task.id}`}
                  className="w-full"
                  aria-invalid={priorityField.invalid}
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
              <FieldError>{priorityField.error}</FieldError>
            </Field>

            <Field data-invalid={statusField.invalid}>
              <FieldLabel htmlFor={`task-status-${task.id}`}>Status</FieldLabel>
              <Select name="status" defaultValue={status}>
                <SelectTrigger
                  id={`task-status-${task.id}`}
                  className="w-full"
                  aria-invalid={statusField.invalid}
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
              <FieldError>{statusField.error}</FieldError>
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

export function TaskFormSheet(props: TaskFormSheetProps) {
  if (props.mode === "create") {
    return (
      <CreateTaskForm open={props.open} onOpenChange={props.onOpenChange} />
    );
  }

  return (
    <UpdateTaskForm
      open={props.open}
      onOpenChange={props.onOpenChange}
      task={props.task}
    />
  );
}
