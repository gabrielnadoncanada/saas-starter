'use client';

import { useActionState, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteTaskAction } from '@/features/tasks/actions/delete-task.action';
import {
  updateTaskAction,
  updateTaskStatusAction
} from '@/features/tasks/actions/update-task.action';
import {
  formatTaskValue,
  taskLabelOptions,
  taskPriorityOptions,
  taskStatusOptions
} from '@/features/tasks/task-options';
import type { Task } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const fieldClassName =
  'border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';
const textareaClassName =
  'border-input dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

type TaskActionState = {
  error?: string;
  success?: string;
};

function TaskCard({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState<TaskActionState, FormData>(
    updateTaskAction,
    {}
  );
  const [statusState, statusAction, isStatusPending] = useActionState<TaskActionState, FormData>(
    updateTaskStatusAction,
    {}
  );
  const [deleteState, deleteAction, isDeleting] = useActionState<TaskActionState, FormData>(
    deleteTaskAction,
    {}
  );

  useEffect(() => {
    if (updateState.success || statusState.success || deleteState.success) {
      setIsEditing(false);
      void mutate('/api/tasks');
    }
  }, [deleteState.success, statusState.success, updateState.success]);

  return (
    <li>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {task.code} · {task.title}
              </CardTitle>
              <CardDescription>
                {formatTaskValue(task.label)} · {formatTaskValue(task.priority)} priority
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                Updated {new Date(task.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name="taskId" value={task.id} />
                <Button type="submit" variant="destructive" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description ? <p className="text-sm text-foreground">{task.description}</p> : null}
          <form action={statusAction} className="flex flex-col gap-3 md:flex-row md:items-end">
            <input type="hidden" name="taskId" value={task.id} />
            <div className="space-y-2">
              <Label htmlFor={`status-${task.id}`}>Status</Label>
              <select
                id={`status-${task.id}`}
                name="status"
                defaultValue={task.status}
                className={fieldClassName}
              >
                {taskStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTaskValue(option)}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline" disabled={isStatusPending}>
              {isStatusPending ? 'Saving...' : 'Update Status'}
            </Button>
          </form>
          {isEditing ? (
            <form action={updateAction} className="space-y-4 border-t pt-4">
              <input type="hidden" name="taskId" value={task.id} />
              <div className="space-y-2">
                <Label htmlFor={`title-${task.id}`}>Title</Label>
                <Input id={`title-${task.id}`} name="title" defaultValue={task.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`description-${task.id}`}>Description</Label>
                <textarea
                  id={`description-${task.id}`}
                  name="description"
                  defaultValue={task.description ?? ''}
                  className={textareaClassName}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`label-${task.id}`}>Label</Label>
                  <select
                    id={`label-${task.id}`}
                    name="label"
                    defaultValue={task.label}
                    className={fieldClassName}
                  >
                    {taskLabelOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatTaskValue(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`priority-${task.id}`}>Priority</Label>
                  <select
                    id={`priority-${task.id}`}
                    name="priority"
                    defaultValue={task.priority}
                    className={fieldClassName}
                  >
                    {taskPriorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatTaskValue(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit-status-${task.id}`}>Status</Label>
                  <select
                    id={`edit-status-${task.id}`}
                    name="status"
                    defaultValue={task.status}
                    className={fieldClassName}
                  >
                    {taskStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatTaskValue(option)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {updateState.error ? <p className="text-sm text-red-500">{updateState.error}</p> : null}
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : null}
          {statusState.error ? <p className="text-sm text-red-500">{statusState.error}</p> : null}
          {deleteState.error ? <p className="text-sm text-red-500">{deleteState.error}</p> : null}
        </CardContent>
      </Card>
    </li>
  );
}

export function TaskList() {
  const { data, isLoading } = useSWR<Task[]>('/api/tasks', fetcher);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No tasks yet</CardTitle>
          <CardDescription>Create the first task for your team.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {data.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
}
