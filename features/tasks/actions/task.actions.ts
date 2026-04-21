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

type TaskActionErrorState = {
  error: string;
  errorCode?: "UPGRADE_REQUIRED" | "LIMIT_REACHED";
};

function taskActionError(error: unknown): TaskActionErrorState | null {
  if (error instanceof UpgradeRequiredError) {
    return { error: error.message, errorCode: "UPGRADE_REQUIRED" };
  }

  if (error instanceof LimitReachedError) {
    return { error: error.message, errorCode: "LIMIT_REACHED" };
  }

  if (error instanceof Error && error.message === "Organization not found") {
    return { error: error.message };
  }

  return null;
}

function revalidateTasks(): void {
  revalidatePath(routes.app.tasks);
}

/**
 * Wraps a task action handler so that known billing/organization errors are
 * returned as action state while unknown errors re-throw.
 */
async function runTaskAction<State extends FormActionState<Record<string, unknown>>>(
  handler: () => Promise<State>,
): Promise<State> {
  try {
    return await handler();
  } catch (error) {
    const mapped = taskActionError(error);
    if (mapped) {
      return mapped as State;
    }
    throw error;
  }
}

export const createTaskAction = validatedAuthenticatedAction(
  createTaskSchema,
  (data): Promise<CreateTaskActionState> =>
    runTaskAction(async () => {
      const task = await createTask(data);
      revalidateTasks();
      return { success: "Task created", task };
    }),
);

export const updateTaskAction = validatedAuthenticatedAction(
  updateTaskSchema,
  (data) =>
    runTaskAction(async () => {
      await updateTask(data);
      revalidateTasks();
      return { success: "Task updated" };
    }),
);

export const deleteTaskAction = validatedAuthenticatedAction(
  deleteTaskSchema,
  ({ taskId }) =>
    runTaskAction(async () => {
      await deleteTask(taskId);
      revalidateTasks();
      return { success: "Task deleted" };
    }),
);

export const updateTaskStatusAction = validatedAuthenticatedAction(
  updateTaskStatusSchema,
  (data) =>
    runTaskAction(async () => {
      await updateTaskStatus(data);
      revalidateTasks();
      return { success: "Task updated", refreshKey: Date.now() };
    }),
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction(
  bulkDeleteTasksSchema,
  ({ taskIds }): Promise<BulkDeleteTasksActionState> =>
    runTaskAction(async () => {
      const deletedCount = await bulkDeleteTasks(taskIds);
      revalidateTasks();
      return {
        success:
          deletedCount === 1
            ? "1 task deleted"
            : `${deletedCount} tasks deleted`,
        taskIds,
      };
    }),
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction(
  bulkUpdateTaskStatusSchema,
  (data): Promise<BulkUpdateTaskStatusActionState> =>
    runTaskAction(async () => {
      const updatedCount = await bulkUpdateTaskStatus(data);
      revalidateTasks();
      return {
        success:
          updatedCount === 1
            ? "1 task updated"
            : `${updatedCount} tasks updated`,
        status: data.status,
        taskIds: data.taskIds,
      };
    }),
);
