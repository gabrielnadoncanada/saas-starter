"use server";

import { revalidatePath } from "next/cache";

import { updateTaskSchema } from "@/features/tasks/schemas/task.schema";
import { updateTask } from "@/features/tasks/server/tasks";
import type { Task } from "@/features/tasks/types/task.types";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

export const updateTaskAction = validatedAuthenticatedAction<
  typeof updateTaskSchema,
  { task?: Task }
>(
  updateTaskSchema,
  async (data) => {
    const task = await updateTask(data);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task updated",
      task,
    };
  },
);
