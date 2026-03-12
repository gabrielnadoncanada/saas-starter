'use server';

import { revalidatePath } from 'next/cache';

import { routes } from '@/constants/routes';
import { validatedActionWithUser } from '@/lib/auth/validated-action-with-user';
import {
  updateTaskSchema,
  updateTaskStatusSchema
} from '@/features/tasks/schemas/task.schema';
import {
  updateTaskForCurrentTeam,
  updateTaskStatusForCurrentTeam
} from '@/features/tasks/server/tasks';

export const updateTaskAction = validatedActionWithUser(
  updateTaskSchema,
  async (data) => {
    await updateTaskForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: 'Task updated', refreshKey: Date.now() };
  }
);

export const updateTaskStatusAction = validatedActionWithUser(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatusForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: 'Task updated', refreshKey: Date.now() };
  }
);
