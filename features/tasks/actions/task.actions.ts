"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { routes } from "@/constants/routes";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
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
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";
import { assertNotDemo } from "@/lib/demo";
import type { FormActionState } from "@/types/form-action-state";

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

function taskActionError(error: unknown) {
  if (error instanceof UpgradeRequiredError) {
    return { error: error.message, errorCode: "UPGRADE_REQUIRED" as const };
  }

  if (error instanceof LimitReachedError) {
    return { error: error.message, errorCode: "LIMIT_REACHED" as const };
  }

  if (error instanceof Error && error.message === "Organization not found") {
    return { error: error.message };
  }

  return null;
}

export const createTaskAction = validatedAuthenticatedAction(
  createTaskSchema,
  async (data): Promise<CreateTaskActionState> => {
    try {
      const task = await createTask(data);
      revalidatePath(routes.app.tasks);
      return { success: "Task created", task };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);

export const updateTaskAction = validatedAuthenticatedAction(
  updateTaskSchema,
  async (data) => {
    try {
      await updateTask(data);
      revalidatePath(routes.app.tasks);
      return { success: "Task updated" };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);

export const deleteTaskAction = validatedAuthenticatedAction(
  deleteTaskSchema,
  async ({ taskId }) => {
    try {
      await deleteTask(taskId);
      revalidatePath(routes.app.tasks);
      return { success: "Task deleted" };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);

export const updateTaskStatusAction = validatedAuthenticatedAction(
  updateTaskStatusSchema,
  async (data) => {
    try {
      await updateTaskStatus(data);
      revalidatePath(routes.app.tasks);
      return { success: "Task updated", refreshKey: Date.now() };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction(
  bulkDeleteTasksSchema,
  async ({ taskIds }): Promise<BulkDeleteTasksActionState> => {
    const demoBlock = assertNotDemo<BulkDeleteTasksActionState>();
    if (demoBlock) return demoBlock;

    try {
      const deletedCount = await bulkDeleteTasks(taskIds);
      revalidatePath(routes.app.tasks);
      return {
        success:
          deletedCount === 1
            ? "1 task deleted"
            : `${deletedCount} tasks deleted`,
        taskIds,
      };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction(
  bulkUpdateTaskStatusSchema,
  async (data): Promise<BulkUpdateTaskStatusActionState> => {
    try {
      const updatedCount = await bulkUpdateTaskStatus(data);
      revalidatePath(routes.app.tasks);
      return {
        success:
          updatedCount === 1
            ? "1 task updated"
            : `${updatedCount} tasks updated`,
        status: data.status,
        taskIds: data.taskIds,
      };
    } catch (error) {
      const mapped = taskActionError(error);
      if (mapped) {
        return mapped;
      }
      throw error;
    }
  },
);
