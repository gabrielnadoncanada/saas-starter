'use client';

import { useActionState, useEffect } from 'react';
import { mutate } from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTaskAction } from '@/features/tasks/actions/create-task.action';
import {
  formatTaskValue,
  taskLabelOptions,
  taskPriorityOptions
} from '@/features/tasks/task-options';

const selectClassName =
  'border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const textareaClassName =
  'border-input dark:bg-input/30 min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

type TaskActionState = {
  error?: string;
  success?: string;
};

export function TaskCreateForm() {
  const [state, formAction, isPending] = useActionState<TaskActionState, FormData>(
    createTaskAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      void mutate('/api/tasks');
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Ship the onboarding flow" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Optional implementation notes"
              className={textareaClassName}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <select id="label" name="label" className={selectClassName} defaultValue="FEATURE">
                {taskLabelOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTaskValue(option)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                className={selectClassName}
                defaultValue="MEDIUM"
              >
                {taskPriorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTaskValue(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
