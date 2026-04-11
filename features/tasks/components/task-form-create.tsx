"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import {
  createTaskAction,
  type CreateTaskActionState,
} from "@/features/tasks/actions/task.actions";
import {
  taskLabels,
  taskPriorities,
} from "@/features/tasks/task-display";
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

type CreateTaskFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTaskForm({ open, onOpenChange }: CreateTaskFormProps) {
  const router = useRouter();
  const lastHandledStateRef = useRef<CreateTaskActionState | null>(null);
  const [state, formAction, isPending] = useActionState<
    CreateTaskActionState,
    FormData
  >(createTaskAction, {});

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

  const titleValue = state.values?.title ?? "";
  const descriptionValue = state.values?.description ?? "";
  const labelValue = state.values?.label ?? "FEATURE";
  const priorityValue = state.values?.priority ?? "MEDIUM";

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
