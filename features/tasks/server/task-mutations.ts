import "server-only";

import { Prisma, type Task } from "@prisma/client";

import { assertCapability } from "@/features/billing/guards/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { consumeMonthlyUsage } from "@/features/billing/usage/usage-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import type {
  BulkDeleteTasksValues,
  BulkUpdateTaskStatusValues,
  CreateTaskValues,
  UpdateTaskValues,
} from "@/features/tasks/task-form.schema";
import type { TaskStatus } from "@/shared/lib/db/enums";
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

export async function createTask(input: CreateTaskValues): Promise<Task> {
  const entitlements = await getCurrentOrganizationEntitlements();

  if (!entitlements) {
    throw new Error("Organization not found");
  }

  assertCapability(entitlements, "task.create");

  return db.$transaction(async (tx) => {
    await consumeMonthlyUsage(
      entitlements.organizationId,
      "tasksPerMonth",
      entitlements,
      { db: tx },
    );

    for (let attempt = 0; attempt < MAX_TASK_CODE_ATTEMPTS; attempt += 1) {
      const latestTask = await tx.task.findFirst({
        where: {
          organizationId: entitlements.organizationId,
        },
        orderBy: {
          id: "desc",
        },
        select: {
          code: true,
        },
      });

      const latestCode = latestTask?.code ?? "TASK-0";
      const latestNumber = Number(latestCode.replace("TASK-", "")) || 0;
      const nextCode = `TASK-${latestNumber + 1}`;

      try {
        return await tx.task.create({
          data: {
            organizationId: entitlements.organizationId,
            code: nextCode,
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

export async function updateTaskStatus(input: {
  taskId: number;
  status: TaskStatus;
}) {
  const organizationId = await getOrganizationId();

  const { count } = await db.task.updateMany({
    where: {
      id: input.taskId,
      organizationId,
    },
    data: {
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

export async function bulkUpdateTaskStatus(input: BulkUpdateTaskStatusValues) {
  const organizationId = await getOrganizationId();

  const { count } = await db.task.updateMany({
    where: {
      id: {
        in: input.taskIds,
      },
      organizationId,
    },
    data: {
      status: input.status,
    },
  });

  if (count === 0) {
    throw new Error("Tasks not found");
  }

  return count;
}

export async function bulkDeleteTasks(
  taskIds: BulkDeleteTasksValues["taskIds"],
) {
  const organizationId = await getOrganizationId();

  const { count } = await db.task.deleteMany({
    where: {
      id: {
        in: taskIds,
      },
      organizationId,
    },
  });

  if (count === 0) {
    throw new Error("Tasks not found");
  }

  return count;
}
