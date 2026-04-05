"use client";

import type { Task } from "@prisma/client";
import { Loader2 } from "lucide-react";

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
import { getFieldState } from "@/shared/lib/get-field-state";

type TaskFormProps = {
  attachmentsSlot?: React.ReactNode;
  mode: "create" | "update";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: {
    values?: Record<string, string | number | undefined>;
    fieldErrors?: Record<string, string[] | undefined>;
  };
  formAction: (payload: FormData) => void;
  isPending: boolean;
  task?: Task;
};

function getFieldValue(
  stateValue: string | number | undefined,
  fallbackValue: string,
) {
  return stateValue === undefined ? fallbackValue : String(stateValue);
}

export function TaskForm({
  attachmentsSlot,
  mode,
  open,
  onOpenChange,
  state,
  formAction,
  isPending,
  task,
}: TaskFormProps) {
  const titleField = getFieldState(state, "title");
  const descriptionField = getFieldState(state, "description");
  const labelField = getFieldState(state, "label");
  const priorityField = getFieldState(state, "priority");
  const statusField = getFieldState(state, "status");
  const isUpdate = mode === "update";
  const title = getFieldValue(state.values?.title, task?.title ?? "");
  const description = getFieldValue(
    state.values?.description,
    task?.description ?? "",
  );
  const label = getFieldValue(state.values?.label, task?.label ?? "FEATURE");
  const priority = getFieldValue(
    state.values?.priority,
    task?.priority ?? "MEDIUM",
  );
  const status = getFieldValue(state.values?.status, task?.status ?? "TODO");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update Task" : "Create Task"}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? `Edit ${task?.code ?? ""} for the current organization.`
              : "Add a task for the current organization."}
          </SheetDescription>
        </SheetHeader>

        <form
          action={formAction}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4"
        >
          {task ? <input type="hidden" name="taskId" value={task.id} /> : null}

          <FieldGroup className="gap-4">
            <Field data-invalid={titleField.invalid}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                name="title"
                defaultValue={title}
                placeholder={"Ship the onboarding polish"}
                aria-invalid={titleField.invalid}
                required
              />
              <FieldError>{titleField.error}</FieldError>
            </Field>

            <Field data-invalid={descriptionField.invalid}>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                name="description"
                defaultValue={description}
                placeholder={"Optional context for the task"}
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor="task-label">Label</FieldLabel>
              <Select name="label" defaultValue={label}>
                <SelectTrigger
                  id="task-label"
                  className="w-full"
                  aria-invalid={labelField.invalid}
                >
                  <SelectValue placeholder={"Select a label"} />
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
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <Select name="priority" defaultValue={priority}>
                <SelectTrigger
                  id="task-priority"
                  className="w-full"
                  aria-invalid={priorityField.invalid}
                >
                  <SelectValue placeholder={"Select a priority"} />
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

            {isUpdate ? (
              <Field data-invalid={statusField.invalid}>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <Select name="status" defaultValue={status}>
                  <SelectTrigger
                    id="task-status"
                    className="w-full"
                    aria-invalid={statusField.invalid}
                  >
                    <SelectValue placeholder={"Select a status"} />
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
            ) : null}
          </FieldGroup>

          {attachmentsSlot}

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
              ) : isUpdate ? (
                "Save Changes"
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
