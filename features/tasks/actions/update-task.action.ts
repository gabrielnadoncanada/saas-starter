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

export const updateTaskAction = validatedActionWithUser(
  updateTaskSchema,
  async (data) => {
    await updateTaskForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task updated", refreshKey: Date.now() };
  },
);

export const updateTaskStatusAction = validatedActionWithUser(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatusForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task updated", refreshKey: Date.now() };
  },
);

export const bulkUpdateTaskStatusAction = validatedActionWithUser(
  bulkUpdateTaskStatusSchema,
  async (data) => {
    const updatedCount = await bulkUpdateTaskStatusForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return {
      success: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated`,
    };
  },
);
