"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";
import {
  bulkUpdateTaskStatusSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";
import {
  bulkUpdateTaskStatusForCurrentOrganization,
  updateTaskForCurrentOrganization,
  updateTaskStatusForCurrentOrganization,
} from "@/features/tasks/server/tasks";
import type { Task } from "@/features/tasks/types/task.types";

export const updateTaskAction = validatedAuthenticatedAction<
  typeof updateTaskSchema,
  { task?: Task }
>(
  updateTaskSchema,
  async (data) => {
    const task = await updateTaskForCurrentOrganization(data);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task updated",
      task,
    };
  },
);

export const updateTaskStatusAction = validatedAuthenticatedAction<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatusForCurrentOrganization(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task updated", refreshKey: Date.now() };
  },
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(
  bulkUpdateTaskStatusSchema,
  async (data) => {
    const updatedCount = await bulkUpdateTaskStatusForCurrentOrganization(data);
    revalidatePath(routes.app.tasks);

    return {
      success: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated`,
      status: data.status,
      taskIds: data.taskIds,
    };
  },
);

