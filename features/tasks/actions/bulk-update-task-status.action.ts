"use server";

import { revalidatePath } from "next/cache";

import { bulkUpdateTaskStatusSchema } from "@/features/tasks/schemas/task.schema";
import { bulkUpdateTaskStatus } from "@/features/tasks/server/tasks";
import type { Task } from "@/features/tasks/types/task.types";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(
  bulkUpdateTaskStatusSchema,
  async (data) => {
    const updatedCount = await bulkUpdateTaskStatus(data);
    revalidatePath(routes.app.tasks);

    return {
      success: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated`,
      status: data.status,
      taskIds: data.taskIds,
    };
  },
);
