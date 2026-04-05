"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
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
  type BulkDeleteTasksValues,
  bulkUpdateTaskStatusSchema,
  type BulkUpdateTaskStatusValues,
  createTaskSchema,
  type CreateTaskValues,
  deleteTaskSchema,
  type DeleteTaskValues,
  updateTaskSchema,
  updateTaskStatusSchema,
  type UpdateTaskValues,
} from "@/features/tasks/task-form.schema";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
  task?: Task;
};

export type UpdateTaskActionState = FormActionState<UpdateTaskValues>;
export type DeleteTaskActionState = FormActionState<DeleteTaskValues> & {
  taskId?: number;
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

const taskActionOptions = { validationNamespace: "tasks" } as const;

export const createTaskAction = validatedAuthenticatedAction<
  typeof createTaskSchema,
  { task?: Task }
>(
  createTaskSchema,
  async (data) => {
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
  },
  taskActionOptions,
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
  taskActionOptions,
);

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  { taskId?: number }
>(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTask(taskId);

    revalidatePath(routes.app.tasks);

    return {
      success: "Task deleted",
      taskId,
    };
  },
  taskActionOptions,
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
  taskActionOptions,
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
  taskActionOptions,
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
  taskActionOptions,
);
