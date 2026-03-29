"use server";

import { revalidatePath } from "next/cache";

import { updateTaskStatusSchema } from "@/features/tasks/schemas/task.schema";
import { updateTaskStatusForCurrentOrganization } from "@/features/tasks/server/tasks";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

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
