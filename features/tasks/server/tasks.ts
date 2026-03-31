import "server-only";

import { z } from "zod";

import { requireCurrentOrganizationId } from "@/features/organizations/server/require-current-organization-id";
import type {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";
import { db } from "@/shared/lib/db/prisma";

type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
type BulkUpdateTaskStatusInput = z.infer<typeof bulkUpdateTaskStatusSchema>;

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