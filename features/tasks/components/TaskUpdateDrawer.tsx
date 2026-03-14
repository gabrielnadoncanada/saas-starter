"use client";

import { useActionState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { updateTaskAction } from '@/features/tasks/actions/update-task.action';
import { labels, priorities, statuses } from '@/features/tasks/constants';
import type { Task } from '@/features/tasks/types/task.types';
import { getFieldState } from '@/shared/lib/get-field-state';
import { useToastMessage } from '@/shared/hooks/useToastMessage';
import { Button } from '@/shared/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Textarea } from '@/shared/components/ui/textarea';

const selectClassName =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

type TaskUpdateDrawerProps = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskUpdateDrawer({
  task,
  open,
  onOpenChange,
}: TaskUpdateDrawerProps) {
  const [state, formAction, isPending] = useActionState(updateTaskAction, {});

  const title = state.values?.title ?? task.title;
  const description = state.values?.description ?? task.description ?? '';
  const label = state.values?.label ?? task.label;
  const priority = state.values?.priority ?? task.priority;
  const status = state.values?.status ?? task.status;

  const titleField = getFieldState(state, 'title');
  const descriptionField = getFieldState(state, 'description');
  const labelField = getFieldState(state, 'label');
  const priorityField = getFieldState(state, 'priority');
  const statusField = getFieldState(state, 'status');

  useToastMessage(state.error, {
    kind: 'error',
    skip: Boolean(state.fieldErrors),
  });
  useToastMessage(state.success, {
    kind: 'success',
  });

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [onOpenChange, state.success]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>Update Task</SheetTitle>
          <SheetDescription>Edit {task.code} for the current team.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className='flex flex-1 flex-col gap-6 overflow-y-auto px-4'>
          <input type='hidden' name='taskId' value={task.id} />

          <FieldGroup className='gap-4'>
            <Field data-invalid={titleField.invalid}>
              <FieldLabel htmlFor={`task-title-${task.id}`}>Title</FieldLabel>
              <Input
                id={`task-title-${task.id}`}
                name='title'
                defaultValue={title}
                placeholder='Ship the onboarding polish'
                aria-invalid={titleField.invalid}
                required
              />
              <FieldError>{titleField.error}</FieldError>
            </Field>

            <Field data-invalid={descriptionField.invalid}>
              <FieldLabel htmlFor={`task-description-${task.id}`}>Description</FieldLabel>
              <Textarea
                id={`task-description-${task.id}`}
                name='description'
                defaultValue={description}
                placeholder='Optional context for the task'
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor={`task-label-${task.id}`}>Label</FieldLabel>
              <select
                id={`task-label-${task.id}`}
                name='label'
                defaultValue={label}
                aria-invalid={labelField.invalid}
                className={selectClassName}
              >
                {labels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError>{labelField.error}</FieldError>
            </Field>

            <Field data-invalid={priorityField.invalid}>
              <FieldLabel htmlFor={`task-priority-${task.id}`}>Priority</FieldLabel>
              <select
                id={`task-priority-${task.id}`}
                name='priority'
                defaultValue={priority}
                aria-invalid={priorityField.invalid}
                className={selectClassName}
              >
                {priorities.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError>{priorityField.error}</FieldError>
            </Field>

            <Field data-invalid={statusField.invalid}>
              <FieldLabel htmlFor={`task-status-${task.id}`}>Status</FieldLabel>
              <select
                id={`task-status-${task.id}`}
                name='status'
                defaultValue={status}
                aria-invalid={statusField.invalid}
                className={selectClassName}
              >
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError>{statusField.error}</FieldError>
            </Field>
          </FieldGroup>

          <SheetFooter className='mt-auto gap-2 px-0'>
            <SheetClose asChild>
              <Button type='button' variant='outline' disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
