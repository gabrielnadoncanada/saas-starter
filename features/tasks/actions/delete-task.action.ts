"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";
import {
  bulkDeleteTasksSchema,
  deleteTaskSchema,
} from "@/features/tasks/schemas/task.schema";
import {
  bulkDeleteTasksForCurrentTeam,
  deleteTaskForCurrentTeam,
} from "@/features/tasks/server/tasks";

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  { taskId?: number }
>(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTaskForCurrentTeam(taskId);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task deleted",
      taskId,
    };
  },
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction<
  typeof bulkDeleteTasksSchema,
  { taskIds?: number[] }
>(
  bulkDeleteTasksSchema,
  async ({ taskIds }) => {
    const deletedCount = await bulkDeleteTasksForCurrentTeam(taskIds);
    revalidatePath(routes.app.tasks);

    return {
      success: `${deletedCount} task${deletedCount > 1 ? "s" : ""} deleted`,
      taskIds,
    };
  },
);
