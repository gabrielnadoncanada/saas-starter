import "server-only";

import { z } from "zod";

import { db } from "@/shared/lib/db/prisma";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
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

async function requireCurrentTeamId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const userWithTeam = await getUserTeamMembership(user.id);

  if (!userWithTeam?.teamId) {
    throw new Error("User is not part of a team");
  }

  return userWithTeam.teamId;
}

export async function listCurrentTeamTasks() {
  const teamId = await requireCurrentTeamId();

  return db.task.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTaskForCurrentTeam(input: UpdateTaskInput) {
  const teamId = await requireCurrentTeamId();
  const existingTask = await db.task.findFirst({
    where: {
      id: input.taskId,
      teamId,
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
  const teamId = await requireCurrentTeamId();

  const result = await db.task.updateMany({
    where: {
      id: input.taskId,
      teamId,
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
  const teamId = await requireCurrentTeamId();

  const result = await db.task.deleteMany({
    where: {
      id: taskId,
      teamId,
    },
  });

  if (result.count === 0) {
    throw new Error("Task not found");
  }
}

export async function bulkUpdateTaskStatusForCurrentTeam(
  input: BulkUpdateTaskStatusInput,
) {
  const teamId = await requireCurrentTeamId();

  const result = await db.task.updateMany({
    where: {
      id: { in: input.taskIds },
      teamId,
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
  const teamId = await requireCurrentTeamId();

  const result = await db.task.deleteMany({
    where: {
      id: { in: taskIds },
      teamId,
    },
  });

  if (result.count === 0) {
    throw new Error("Tasks not found");
  }

  return result.count;
}
