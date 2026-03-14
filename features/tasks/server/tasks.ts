import "server-only";

import { z } from "zod";

import { db } from "@/shared/lib/db/prisma";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getUserTeamMembership } from "@/features/teams/server/team-membership";
import type {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/schemas/task.schema";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
type BulkUpdateTaskStatusInput = z.infer<typeof bulkUpdateTaskStatusSchema>;

function isUniqueCodeError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

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

async function createTaskCode(teamId: number) {
  const latestTask = await db.task.findFirst({
    where: { teamId },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  const latestNumber = Number(latestTask?.code.replace("TASK-", "")) || 0;
  return `TASK-${latestNumber + 1}`;
}

export async function listCurrentTeamTasks() {
  const teamId = await requireCurrentTeamId();

  return db.task.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTaskForCurrentTeam(input: CreateTaskInput) {
  const teamId = await requireCurrentTeamId();
  let code = await createTaskCode(teamId);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.task.create({
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

      const nextNumber = Number(code.replace("TASK-", "")) + 1;
      code = `TASK-${nextNumber}`;
    }
  }

  throw new Error("Could not generate a unique task code");
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
