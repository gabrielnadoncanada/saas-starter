"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { LimitReachedError } from "@/features/billing/errors/limit-reached";
import { UpgradeRequiredError } from "@/features/billing/errors/upgrade-required";
import {
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  createTaskForCurrentOrganization,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "@/features/tasks/server/task-mutations";
import {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/task-schemas";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

type CreateTaskValues = z.infer<typeof createTaskSchema>;
type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
type DeleteTaskValues = z.infer<typeof deleteTaskSchema>;
type BulkDeleteTaskValues = z.infer<typeof bulkDeleteTasksSchema>;
type BulkUpdateTaskStatusValues = z.infer<typeof bulkUpdateTaskStatusSchema>;

export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
  task?: Task;
};

export type UpdateTaskActionState = FormActionState<UpdateTaskValues>;

export type DeleteTaskActionState = FormActionState<DeleteTaskValues> & {
  taskId?: number;
};

export type BulkDeleteTasksActionState =
  FormActionState<BulkDeleteTaskValues> & {
    taskIds?: number[];
  };

export type BulkUpdateTaskStatusActionState =
  FormActionState<BulkUpdateTaskStatusValues> & {
    status?: Task["status"];
    taskIds?: number[];
  };

export const createTaskAction = validatedAuthenticatedAction<
  typeof createTaskSchema,
  { task?: Task }
>(createTaskSchema, async (data) => {
  try {
    const task = await createTaskForCurrentOrganization(data);
    revalidatePath(routes.app.tasks);

    return {
      success: "Task created",
      task,
    };
  } catch (error) {
    if (
      error instanceof UpgradeRequiredError ||
      error instanceof LimitReachedError ||
      (error instanceof Error && error.message === "Organization not found")
    ) {
      return { error: error.message };
    }

    throw error;
  }
});

export const updateTaskAction = validatedAuthenticatedAction<
  typeof updateTaskSchema,
  {}
>(updateTaskSchema, async (data) => {
  await updateTask(data);
  revalidatePath(routes.app.tasks);

  return {
    success: "Task updated",
  };
});

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  { taskId?: number }
>(deleteTaskSchema, async ({ taskId }) => {
  await deleteTask(taskId);
  revalidatePath(routes.app.tasks);

  return {
    success: "Task deleted",
    taskId,
  };
});

export const updateTaskStatusAction = validatedAuthenticatedAction<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(updateTaskStatusSchema, async (data) => {
  await updateTaskStatus(data);
  revalidatePath(routes.app.tasks);

  return {
    success: "Task updated",
    refreshKey: Date.now(),
  };
});

export const bulkDeleteTasksAction = validatedAuthenticatedAction<
  typeof bulkDeleteTasksSchema,
  { taskIds?: number[] }
>(bulkDeleteTasksSchema, async ({ taskIds }) => {
  const deletedCount = await bulkDeleteTasks(taskIds);
  revalidatePath(routes.app.tasks);

  return {
    success: `${deletedCount} task${deletedCount > 1 ? "s" : ""} deleted`,
    taskIds,
  };
});

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(bulkUpdateTaskStatusSchema, async (data) => {
  const updatedCount = await bulkUpdateTaskStatus(data);
  revalidatePath(routes.app.tasks);

  return {
    success: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated`,
    status: data.status,
    taskIds: data.taskIds,
  };
});
