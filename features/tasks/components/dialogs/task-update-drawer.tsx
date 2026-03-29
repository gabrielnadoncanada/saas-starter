"use client";

import { useActionState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { updateTaskAction } from '@/features/tasks/actions/update-task.action';
import { labels, priorities, statuses } from '@/features/tasks/constants';
import type { UpdateTaskActionState } from '@/features/tasks/types/task-action.types';
import type { Task } from '@/features/tasks/types/task.types';
import { getFieldState } from '@/shared/lib/get-field-state';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { Button } from '@/shared/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<UpdateTaskActionState, FormData>(
    updateTaskAction,
    {}
  );

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

  useFormActionToasts(state);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.success]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>Update Task</SheetTitle>
          <SheetDescription>Edit {task.code} for the current organization.</SheetDescription>
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
              <Select
                name='label'
                defaultValue={label}
              >
                <SelectTrigger
                  id={`task-label-${task.id}`}
                  className='w-full'
                  aria-invalid={labelField.invalid}
                >
                  <SelectValue placeholder='Select a label' />
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
              <FieldLabel htmlFor={`task-priority-${task.id}`}>Priority</FieldLabel>
              <Select
                name='priority'
                defaultValue={priority}
              >
                <SelectTrigger
                  id={`task-priority-${task.id}`}
                  className='w-full'
                  aria-invalid={priorityField.invalid}
                >
                  <SelectValue placeholder='Select a priority' />
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

            <Field data-invalid={statusField.invalid}>
              <FieldLabel htmlFor={`task-status-${task.id}`}>Status</FieldLabel>
              <Select
                name='status'
                defaultValue={status}
              >
                <SelectTrigger
                  id={`task-status-${task.id}`}
                  className='w-full'
                  aria-invalid={statusField.invalid}
                >
                  <SelectValue placeholder='Select a status' />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
