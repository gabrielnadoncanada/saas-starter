"use server";

import { revalidatePath } from "next/cache";

import { deleteTaskSchema } from "@/features/tasks/schemas/task.schema";
import { deleteTask } from "@/features/tasks/server/tasks";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  { taskId?: number }
>(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTask(taskId);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task deleted",
      taskId,
    };
  },
);
