import "server-only";

import { z } from "zod";

import { getActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import type {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
type BulkUpdateTaskStatusInput = z.infer<typeof bulkUpdateTaskStatusSchema>;

async function requireCurrentOrganizationId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const membership = await getActiveOrganizationMembership(user.id);

  if (!membership?.organizationId) {
    throw new Error("User is not part of an organization");
  }

  return membership.organizationId;
}

export async function listTasks() {
  const organizationId = await requireCurrentOrganizationId();

  return db.task.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTask(input: UpdateTaskInput) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.updateMany({
    where: {
      id: input.taskId,
      organizationId,
    },
    data: {
      title: input.title,
      description: input.description || null,
      label: input.label,
      priority: input.priority,
      status: input.status,
    },
  });

  if (result.count === 0) {
    throw new Error("Task not found");
  }
}

export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.updateMany({
    where: {
      id: input.taskId,
      organizationId,
    },
    data: {
      status: input.status,
    },
  });

  if (result.count === 0) {
    throw new Error("Task not found");
  }
}

export async function deleteTask(taskId: DeleteTaskInput["taskId"]) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.deleteMany({
    where: {
      id: taskId,
      organizationId,
    },
  });

  if (result.count === 0) {
    throw new Error("Task not found");
  }
}

export async function bulkUpdateTaskStatus(
  input: BulkUpdateTaskStatusInput,
) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.updateMany({
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

  if (result.count === 0) {
    throw new Error("Tasks not found");
  }

  return result.count;
}

export async function bulkDeleteTasks(
  taskIds: BulkDeleteTasksInput["taskIds"],
) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.deleteMany({
    where: {
      id: {
        in: taskIds,
      },
      organizationId,
    },
  });

  if (result.count === 0) {
    throw new Error("Tasks not found");
  }

  return result.count;
}