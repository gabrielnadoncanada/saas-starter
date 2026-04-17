import "server-only";

import { Prisma, type Task } from "@prisma/client";

import { assertCapability } from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import { consumeMonthlyUsage } from "@/features/billing/server/usage-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import type {
  BulkDeleteTasksValues,
  BulkUpdateTaskStatusValues,
  CreateTaskValues,
  UpdateTaskValues,
} from "@/features/tasks/task.schema";
import type { TaskStatus } from "@/lib/db/enums";
import { db } from "@/lib/db/prisma";

const MAX_TASK_CODE_ATTEMPTS = 10;

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function generateNextTaskCode(tx: TxClient): Promise<string> {
  const latestTask = await tx.task.findFirst({
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
      const code = await generateNextTaskCode(tx);

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
  await requireActiveOrganizationMembership();

  return db.task.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTask(input: UpdateTaskValues) {
  await requireActiveOrganizationMembership();

  const { count } = await db.task.updateMany({
    where: { id: input.taskId },
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

export async function updateTaskStatus(input: {
  taskId: number;
  status: TaskStatus;
}) {
  await requireActiveOrganizationMembership();

  const { count } = await db.task.updateMany({
    where: { id: input.taskId },
    data: {
      status: input.status,
    },
  });

  if (count === 0) {
    throw new Error("Task not found");
  }
}

export async function deleteTask(taskId: number) {
  await requireActiveOrganizationMembership();

  const { count } = await db.task.deleteMany({
    where: { id: taskId },
  });

  if (count === 0) {
    throw new Error("Task not found");
  }
}

export async function bulkUpdateTaskStatus(input: BulkUpdateTaskStatusValues) {
  await requireActiveOrganizationMembership();

  const { count } = await db.task.updateMany({
    where: { id: { in: input.taskIds } },
    data: { status: input.status },
  });

  if (count === 0) {
    throw new Error("Tasks not found");
  }

  return count;
}

export async function bulkDeleteTasks(
  taskIds: BulkDeleteTasksValues["taskIds"],
) {
  await requireActiveOrganizationMembership();

  const { count } = await db.task.deleteMany({
    where: { id: { in: taskIds } },
  });

  if (count === 0) {
    throw new Error("Tasks not found");
  }

  return count;
}
