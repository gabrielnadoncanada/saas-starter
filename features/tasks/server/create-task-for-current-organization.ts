import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/shared/lib/db/prisma";
import { assertCapability } from "@/features/billing/guards";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
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

async function createTaskCode(organizationId: string, client: TaskDbClient) {
  const latestTask = await client.task.findFirst({
    where: { organizationId },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  const latestNumber = Number(latestTask?.code.replace("TASK-", "")) || 0;
  return `TASK-${latestNumber + 1}`;
}

async function createTaskRecord(
  organizationId: string,
  input: CreateTaskInput,
  client: TaskDbClient,
): Promise<Task> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = await createTaskCode(organizationId, client);

    try {
      return await client.task.create({
        data: {
          organizationId,
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

export async function createTaskForCurrentOrganization(
  input: CreateTaskInput,
): Promise<Task> {
  const organizationPlan = await getOrganizationPlan();

  if (!organizationPlan) {
    throw new Error("Organization not found");
  }

  assertCapability(organizationPlan.planId, "task.create");

  return db.$transaction(async (tx) => {
    await consumeMonthlyUsage(
      organizationPlan.organizationId,
      "tasksPerMonth",
      organizationPlan.planId,
      { db: tx },
    );

    return createTaskRecord(organizationPlan.organizationId, input, tx);
  });
}

