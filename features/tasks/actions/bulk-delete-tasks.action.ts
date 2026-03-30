"use server";

import { revalidatePath } from "next/cache";

import { bulkDeleteTasksSchema } from "@/features/tasks/schemas/task.schema";
import { bulkDeleteTasks } from "@/features/tasks/server/tasks";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const bulkDeleteTasksAction = validatedAuthenticatedAction<
  typeof bulkDeleteTasksSchema,
  { taskIds?: number[] }
>(
  bulkDeleteTasksSchema,
  async ({ taskIds }) => {
    const deletedCount = await bulkDeleteTasks(taskIds);
    revalidatePath(routes.app.tasks);

    return {
      success: `${deletedCount} task${deletedCount > 1 ? "s" : ""} deleted`,
      taskIds,
    };
  },
);
