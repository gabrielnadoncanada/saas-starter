"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import {
  bulkDeleteTasksSchema,
  deleteTaskSchema,
} from "@/features/tasks/schemas/task.schema";
import {
  bulkDeleteTasksForCurrentTeam,
  deleteTaskForCurrentTeam,
} from "@/features/tasks/server/tasks";

export const deleteTaskAction = validatedActionWithUser(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTaskForCurrentTeam(taskId);
    revalidatePath(routes.app.tasks);

    return { success: "Task deleted", refreshKey: Date.now() };
  },
);

export const bulkDeleteTasksAction = validatedActionWithUser(
  bulkDeleteTasksSchema,
  async ({ taskIds }) => {
    const deletedCount = await bulkDeleteTasksForCurrentTeam(taskIds);
    revalidatePath(routes.app.tasks);

    return {
      success: `${deletedCount} task${deletedCount > 1 ? "s" : ""} deleted`,
    };
  },
);
