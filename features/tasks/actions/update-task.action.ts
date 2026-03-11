'use server';

import { revalidatePath } from 'next/cache';

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
    revalidatePath('/dashboard/tasks');

    return { success: 'Task updated' };
  }
);

export const updateTaskStatusAction = validatedActionWithUser(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatusForCurrentTeam(data);
    revalidatePath('/dashboard/tasks');

    return { success: 'Task updated' };
  }
);
