"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.types";
import { createTaskForCurrentTeam } from "@/features/tasks/server/create-task-for-current-team";
import { UpgradeRequiredError, LimitReachedError } from "@/features/billing/errors";

export const createTaskAction = validatedAuthenticatedAction<
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
      if (
        error instanceof UpgradeRequiredError ||
        error instanceof LimitReachedError ||
        (error instanceof Error && error.message === "Team not found")
      ) {
        return { error: error.message };
      }
      throw error;
    }
  },
);
