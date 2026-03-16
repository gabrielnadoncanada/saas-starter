"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.types";
import { createTaskForCurrentTeam } from "@/features/tasks/server/tasks";
import { getTeamPlan, assertCapability, assertLimit } from "@/features/billing/guards";
import { getMonthlyUsage, recordUsage } from "@/features/billing/usage";
import { UpgradeRequiredError } from "@/features/billing/errors";
import { LimitReachedError } from "@/features/billing/errors";

export const createTaskAction = validatedActionWithUser<
  typeof createTaskSchema,
  { task?: Task }
>(
  createTaskSchema,
  async (data) => {
    const teamPlan = await getTeamPlan();

    if (!teamPlan) {
      return { error: "Team not found" };
    }

    try {
      assertCapability(teamPlan.planId, "task.create");

      const usage = await getMonthlyUsage(teamPlan.teamId, "tasksPerMonth");
      assertLimit(teamPlan.planId, "tasksPerMonth", usage);
    } catch (error) {
      if (error instanceof UpgradeRequiredError) {
        return { error: error.message };
      }
      if (error instanceof LimitReachedError) {
        return { error: error.message };
      }
      throw error;
    }

    const task = await createTaskForCurrentTeam(data);
    await recordUsage(teamPlan.teamId, "tasksPerMonth");
    revalidatePath(routes.app.tasks);

    return {
      success: "Task created",
      task,
    };
  },
);
