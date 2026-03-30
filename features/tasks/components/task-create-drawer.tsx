"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { createTaskAction } from "@/features/tasks/actions/create-task.action";
import { labels } from "@/features/tasks/constants/labels";
import { priorities } from "@/features/tasks/constants/priorities";
import type { CreateTaskActionState } from "@/features/tasks/types/task-action.types";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";
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

type TaskCreateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskCreateDrawer({ open, onOpenChange }: TaskCreateDrawerProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    CreateTaskActionState,
    FormData
  >(createTaskAction, {});

  const title = state.values?.title ?? "";
  const description = state.values?.description ?? "";
  const label = state.values?.label ?? "FEATURE";
  const priority = state.values?.priority ?? "MEDIUM";

  const titleField = getFieldState(state, "title");
  const descriptionField = getFieldState(state, "description");
  const labelField = getFieldState(state, "label");
  const priorityField = getFieldState(state, "priority");

  useFormActionToasts(state);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
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
                defaultValue={title}
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
                defaultValue={description}
                placeholder="Optional context for the task"
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor="create-task-label">Label</FieldLabel>
              <Select name="label" defaultValue={label}>
                <SelectTrigger
                  id="create-task-label"
                  className="w-full"
                  aria-invalid={labelField.invalid}
                >
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  {labels.map((option) => (
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
              <Select name="priority" defaultValue={priority}>
                <SelectTrigger
                  id="create-task-priority"
                  className="w-full"
                  aria-invalid={priorityField.invalid}
                >
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((option) => (
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
