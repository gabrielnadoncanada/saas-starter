"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/plan-guards";
import {
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "@/features/tasks/server/task-mutations";
import {
  bulkDeleteTasksSchema,
  type BulkDeleteTasksValues,
  bulkUpdateTaskStatusSchema,
  type BulkUpdateTaskStatusValues,
  createTaskSchema,
  type CreateTaskValues,
  deleteTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/features/tasks/task.schema";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
  task?: Task;
};

export type BulkDeleteTasksActionState =
  FormActionState<BulkDeleteTasksValues> & {
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
>(
  createTaskSchema,
  async (data) => {
    try {
      const task = await createTask(data);

      revalidatePath(routes.app.tasks);

      return {
        success: "Task created",
        task,
      };
    } catch (error) {
      if (error instanceof UpgradeRequiredError) {
        return { error: error.message, errorCode: "UPGRADE_REQUIRED" };
      }
      if (error instanceof LimitReachedError) {
        return { error: error.message, errorCode: "LIMIT_REACHED" };
      }
      if (error instanceof Error && error.message === "Organization not found") {
        return { error: error.message };
      }

      throw error;
    }
  },
);

export const updateTaskAction = validatedAuthenticatedAction<
  typeof updateTaskSchema,
  {}
>(
  updateTaskSchema,
  async (data) => {
    await updateTask(data);

    revalidatePath(routes.app.tasks);

    return { success: "Task updated" };
  },
);

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  {}
>(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTask(taskId);

    revalidatePath(routes.app.tasks);

    return {
      success: "Task deleted",
    };
  },
);

export const updateTaskStatusAction = validatedAuthenticatedAction<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatus(data);

    revalidatePath(routes.app.tasks);

    return {
      success: "Task updated",
      refreshKey: Date.now(),
    };
  },
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction<
  typeof bulkDeleteTasksSchema,
  { taskIds?: number[] }
>(
  bulkDeleteTasksSchema,
  async ({ taskIds }) => {
    const deletedCount = await bulkDeleteTasks(taskIds);

    revalidatePath(routes.app.tasks);

    return {
      success:
        deletedCount === 1 ? "1 task deleted" : `${deletedCount} tasks deleted`,
      taskIds,
    };
  },
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(
  bulkUpdateTaskStatusSchema,
  async (data) => {
    const updatedCount = await bulkUpdateTaskStatus(data);

    revalidatePath(routes.app.tasks);

    return {
      success:
        updatedCount === 1 ? "1 task updated" : `${updatedCount} tasks updated`,
      status: data.status,
      taskIds: data.taskIds,
    };
  },
);
