"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import { createTaskForCurrentTeam } from "@/features/tasks/server/tasks";

export const createTaskAction = validatedActionWithUser(
  createTaskSchema,
  async (data) => {
    await createTaskForCurrentTeam(data);
    revalidatePath(routes.app.tasks);

    return { success: "Task created", refreshKey: Date.now() };
  },
);
