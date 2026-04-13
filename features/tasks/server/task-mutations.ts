import "server-only";

import { Prisma, type Task } from "@prisma/client";

import { assertCapability } from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { consumeMonthlyUsage } from "@/features/billing/server/usage-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import type {
  CreateTaskValues,
  UpdateTaskValues,
} from "@/features/tasks/task.schema";
import { db } from "@/shared/lib/db/prisma";

const MAX_TASK_CODE_ATTEMPTS = 10;

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function getOrganizationId() {
  const membership = await requireActiveOrganizationMembership();
  return membership.organizationId;
}

async function generateNextTaskCode(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<string> {
  const latestTask = await tx.task.findFirst({
    where: { organizationId },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  const latestNumber = Number(latestTask?.code?.replace("TASK-", "")) || 0;
  return `TASK-${latestNumber + 1}`;
}

export async function createTask(input: CreateTaskValues): Promise<Task> {
  const entitlements = await getCurrentEntitlements();

  if (!entitlements) {
    throw new Error("Organization not found");
  }

  assertCapability(entitlements, "task.create");

  return db.$transaction(async (tx) => {
    await consumeMonthlyUsage({
      organizationId: entitlements.organizationId,
      limitKey: "tasksPerMonth",
      entitlements,
      db: tx,
    });

    for (let attempt = 0; attempt < MAX_TASK_CODE_ATTEMPTS; attempt += 1) {
      const code = await generateNextTaskCode(tx, entitlements.organizationId);

      try {
        return await tx.task.create({
          data: {
            organizationId: entitlements.organizationId,
            code,
            title: input.title,
            description: input.description ?? null,
            label: input.label,
            priority: input.priority,
            status: "TODO",
          },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    throw new Error("Could not generate a unique task code");
  });
}

export async function listTasks() {
  const organizationId = await getOrganizationId();

  return db.task.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTask(input: UpdateTaskValues) {
  const organizationId = await getOrganizationId();

  const { count } = await db.task.updateMany({
    where: {
      id: input.taskId,
      organizationId,
    },
    data: {
      title: input.title,
      description: input.description ?? null,
      label: input.label,
      priority: input.priority,
      status: input.status,
    },
  });

  if (count === 0) {
    throw new Error("Task not found");
  }
}

export async function deleteTask(taskId: number) {
  const organizationId = await getOrganizationId();

  const { count } = await db.task.deleteMany({
    where: {
      id: taskId,
      organizationId,
    },
  });

  if (count === 0) {
    throw new Error("Task not found");
  }
}
