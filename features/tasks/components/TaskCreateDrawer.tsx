"use client";

import { useActionState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { createTaskAction } from '@/features/tasks/actions/create-task.action';
import { labels, priorities } from '@/features/tasks/constants';
import { getFieldState } from '@/shared/lib/get-field-state';
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

type TaskCreateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskCreateDrawer({ open, onOpenChange }: TaskCreateDrawerProps) {
  const [state, formAction, isPending] = useActionState(createTaskAction, {});

  const title = state.values?.title ?? '';
  const description = state.values?.description ?? '';
  const label = state.values?.label ?? 'FEATURE';
  const priority = state.values?.priority ?? 'MEDIUM';

  const titleField = getFieldState(state, 'title');
  const descriptionField = getFieldState(state, 'description');
  const labelField = getFieldState(state, 'label');
  const priorityField = getFieldState(state, 'priority');

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [onOpenChange, state.success]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>Create Task</SheetTitle>
          <SheetDescription>Add a task for the current team.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className='flex flex-1 flex-col gap-6 overflow-y-auto px-4'>
          <FieldGroup className='gap-4'>
            <Field data-invalid={titleField.invalid}>
              <FieldLabel htmlFor='create-task-title'>Title</FieldLabel>
              <Input
                id='create-task-title'
                name='title'
                defaultValue={title}
                placeholder='Ship the onboarding polish'
                aria-invalid={titleField.invalid}
                required
              />
              <FieldError>{titleField.error}</FieldError>
            </Field>

            <Field data-invalid={descriptionField.invalid}>
              <FieldLabel htmlFor='create-task-description'>Description</FieldLabel>
              <Textarea
                id='create-task-description'
                name='description'
                defaultValue={description}
                placeholder='Optional context for the task'
                aria-invalid={descriptionField.invalid}
              />
              <FieldError>{descriptionField.error}</FieldError>
            </Field>

            <Field data-invalid={labelField.invalid}>
              <FieldLabel htmlFor='create-task-label'>Label</FieldLabel>
              <select
                id='create-task-label'
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
              <FieldLabel htmlFor='create-task-priority'>Priority</FieldLabel>
              <select
                id='create-task-priority'
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
          </FieldGroup>

          {state.error ? (
            <p className='text-sm text-destructive' aria-live='polite'>
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className='text-sm text-green-600' aria-live='polite'>
              {state.success}
            </p>
          ) : null}

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
                'Create Task'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
