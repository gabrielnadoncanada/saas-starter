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
import type { FormActionState } from "@/shared/types/form-action-state";

type TaskFormValues = {
  title: string;
  description?: string;
  label: string;
  priority: string;
  status?: string;
  taskId?: number;
};

type TaskFormProps = {
  mode: "create" | "update";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: FormActionState<TaskFormValues>;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  task?: Task;
};

export function TaskForm({
  mode,
  open,
  onOpenChange,
  state,
  formAction,
  isPending,
  task,
}: TaskFormProps) {
  const isUpdate = mode === "update";
  const title = getFieldState(state, "title", task?.title ?? "");
  const description = getFieldState(state, "description", task?.description ?? "");
  const label = getFieldState(state, "label", task?.label ?? "FEATURE");
  const priority = getFieldState(state, "priority", task?.priority ?? "MEDIUM");
  const status = getFieldState(state, "status", task?.status ?? "TODO");

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
            <Field data-invalid={title.invalid}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                name="title"
                defaultValue={title.value}
                placeholder={"Ship the onboarding polish"}
                aria-invalid={title.invalid}
                required
              />
              <FieldError>{title.error}</FieldError>
            </Field>

            <Field data-invalid={description.invalid}>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                name="description"
                defaultValue={description.value}
                placeholder={"Optional context for the task"}
                aria-invalid={description.invalid}
              />
              <FieldError>{description.error}</FieldError>
            </Field>

            <Field data-invalid={label.invalid}>
              <FieldLabel htmlFor="task-label">Label</FieldLabel>
              <Select name="label" defaultValue={label.value}>
                <SelectTrigger
                  id="task-label"
                  className="w-full"
                  aria-invalid={label.invalid}
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
              <FieldError>{label.error}</FieldError>
            </Field>

            <Field data-invalid={priority.invalid}>
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <Select name="priority" defaultValue={priority.value}>
                <SelectTrigger
                  id="task-priority"
                  className="w-full"
                  aria-invalid={priority.invalid}
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
              <FieldError>{priority.error}</FieldError>
            </Field>

            {isUpdate ? (
              <Field data-invalid={status.invalid}>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <Select name="status" defaultValue={status.value}>
                  <SelectTrigger
                    id="task-status"
                    className="w-full"
                    aria-invalid={status.invalid}
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
                <FieldError>{status.error}</FieldError>
              </Field>
            ) : null}
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
