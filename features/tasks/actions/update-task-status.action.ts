"use server";

import { revalidatePath } from "next/cache";

import { updateTaskStatusSchema } from "@/features/tasks/schemas/task.schema";
import { updateTaskStatus } from "@/features/tasks/server/tasks";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const updateTaskStatusAction = validatedAuthenticatedAction<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatus(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task updated", refreshKey: Date.now() };
  },
);
