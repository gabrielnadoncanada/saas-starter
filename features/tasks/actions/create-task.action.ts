"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.types";
import { createTaskForCurrentTeam } from "@/features/tasks/server/create-task-for-current-team";
import { UpgradeRequiredError } from "@/features/billing/errors";
import { LimitReachedError } from "@/features/billing/errors";

export const createTaskAction = validatedActionWithUser<
  typeof createTaskSchema,
  { task?: Task }
>(
  createTaskSchema,
  async (data) => {
    try {
      const task = await createTaskForCurrentTeam(data);
      revalidatePath(routes.app.tasks);

      return {
        success: "Task created",
        task,
      };
    } catch (error) {
      if (error instanceof UpgradeRequiredError) {
        return { error: error.message };
      }
      if (error instanceof LimitReachedError) {
        return { error: error.message };
      }
      if (error instanceof Error && error.message === "Team not found") {
        return { error: error.message };
      }
      throw error;
    }
  },
);
