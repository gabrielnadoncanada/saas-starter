'use server';

import { revalidatePath } from 'next/cache';

import { validatedActionWithUser } from '@/lib/auth/validated-action-with-user';
import { createTaskSchema } from '@/features/tasks/schemas/task.schema';
import { createTaskForCurrentTeam } from '@/features/tasks/server/tasks';

export const createTaskAction = validatedActionWithUser(
  createTaskSchema,
  async (data) => {
    await createTaskForCurrentTeam(data);
    revalidatePath('/dashboard/tasks');

    return { success: 'Task created' };
  }
);
