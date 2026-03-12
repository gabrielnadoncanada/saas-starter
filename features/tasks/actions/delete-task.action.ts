'use server';

import { revalidatePath } from 'next/cache';

import { validatedActionWithUser } from '@/lib/auth/validated-action-with-user';
import { deleteTaskSchema } from '@/features/tasks/schemas/task.schema';
import { deleteTaskForCurrentTeam } from '@/features/tasks/server/tasks';

export const deleteTaskAction = validatedActionWithUser(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTaskForCurrentTeam(taskId);
    revalidatePath('/dashboard/tasks');

    return { success: 'Task deleted', refreshKey: Date.now() };
  }
);
