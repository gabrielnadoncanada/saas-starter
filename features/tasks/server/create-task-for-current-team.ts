import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/shared/lib/db/prisma";
import { getTeamPlan, assertCapability } from "@/features/billing/guards";
import { consumeMonthlyUsage } from "@/features/billing/usage";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.types";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type TaskDbClient = Prisma.TransactionClient;

function isUniqueCodeError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function createTaskCode(teamId: number, client: TaskDbClient) {
  const latestTask = await client.task.findFirst({
    where: { teamId },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  const latestNumber = Number(latestTask?.code.replace("TASK-", "")) || 0;
  return `TASK-${latestNumber + 1}`;
}

async function createTaskRecord(
  teamId: number,
  input: CreateTaskInput,
  client: TaskDbClient,
): Promise<Task> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = await createTaskCode(teamId, client);

    try {
      return await client.task.create({
        data: {
          teamId,
          code,
          title: input.title,
          description: input.description || null,
          label: input.label,
          priority: input.priority,
          status: "TODO",
        },
      });
    } catch (error) {
      if (!isUniqueCodeError(error)) {
        throw error;
      }
    }
  }

  throw new Error("Could not generate a unique task code");
}

export async function createTaskForCurrentTeam(
  input: CreateTaskInput,
): Promise<Task> {
  const teamPlan = await getTeamPlan();

  if (!teamPlan) {
    throw new Error("Team not found");
  }

  assertCapability(teamPlan.planId, "task.create");

  return db.$transaction(async (tx) => {
    await consumeMonthlyUsage(
      teamPlan.teamId,
      "tasksPerMonth",
      teamPlan.planId,
      { db: tx },
    );

    return createTaskRecord(teamPlan.teamId, input, tx);
  });
}
