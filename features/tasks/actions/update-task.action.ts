"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import {
  bulkUpdateTaskStatusSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";
import {
  bulkUpdateTaskStatusForCurrentTeam,
  updateTaskForCurrentTeam,
  updateTaskStatusForCurrentTeam,
} from "@/features/tasks/server/tasks";
import type { Task } from "@/features/tasks/types/task.types";

export const updateTaskAction = validatedActionWithUser<
  typeof updateTaskSchema,
  { task?: Task }
>(
  updateTaskSchema,
  async (data) => {
    const task = await updateTaskForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task updated",
      task,
    };
  },
);

export const updateTaskStatusAction = validatedActionWithUser<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatusForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task updated", refreshKey: Date.now() };
  },
);

export const bulkUpdateTaskStatusAction = validatedActionWithUser<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(
  bulkUpdateTaskStatusSchema,
  async (data) => {
    const updatedCount = await bulkUpdateTaskStatusForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return {
      success: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated`,
      status: data.status,
      taskIds: data.taskIds,
    };
  },
);
