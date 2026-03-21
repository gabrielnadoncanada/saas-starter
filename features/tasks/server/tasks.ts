import "server-only";

import { z } from "zod";

import { db } from "@/shared/lib/db/prisma";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getActiveOrganizationMembership } from "@/features/teams/server/organization-membership";
import type {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";

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

export async function listCurrentTeamTasks() {
  const organizationId = await requireCurrentOrganizationId();

  return db.task.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTaskForCurrentTeam(input: UpdateTaskInput) {
  const organizationId = await requireCurrentOrganizationId();
  const existingTask = await db.task.findFirst({
    where: {
      id: input.taskId,
      organizationId,
    },
    select: { id: true },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  return db.task.update({
    where: { id: existingTask.id },
    data: {
      title: input.title,
      description: input.description || null,
      label: input.label,
      priority: input.priority,
      status: input.status,
    },
  });
}

export async function updateTaskStatusForCurrentTeam(
  input: UpdateTaskStatusInput,
) {
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

export async function deleteTaskForCurrentTeam(
  taskId: DeleteTaskInput["taskId"],
) {
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

export async function bulkUpdateTaskStatusForCurrentTeam(
  input: BulkUpdateTaskStatusInput,
) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.updateMany({
    where: {
      id: { in: input.taskIds },
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

export async function bulkDeleteTasksForCurrentTeam(
  taskIds: BulkDeleteTasksInput["taskIds"],
) {
  const organizationId = await requireCurrentOrganizationId();

  const result = await db.task.deleteMany({
    where: {
      id: { in: taskIds },
      organizationId,
    },
  });

  if (result.count === 0) {
    throw new Error("Tasks not found");
  }

  return result.count;
}
