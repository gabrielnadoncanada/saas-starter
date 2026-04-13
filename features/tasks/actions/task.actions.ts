"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export const createTaskAction = validatedAuthenticatedAction(
  createTaskSchema,
  async (data): Promise<CreateTaskActionState> => {
    const task = await createTask(data);
    revalidatePath(routes.app.tasks);
    return { success: "Task created", task };
  },
);

export const updateTaskAction = validatedAuthenticatedAction(
  updateTaskSchema,
  async (data) => {
    await updateTask(data);
    revalidatePath(routes.app.tasks);
    return { success: "Task updated" };
  },
);

export const deleteTaskAction = validatedAuthenticatedAction(
  deleteTaskSchema,
  async ({ taskId }) => {
    await deleteTask(taskId);
    revalidatePath(routes.app.tasks);
    return { success: "Task deleted" };
  },
);

export const updateTaskStatusAction = validatedAuthenticatedAction(
  updateTaskStatusSchema,
  async (data) => {
    await updateTaskStatus(data);
    revalidatePath(routes.app.tasks);
    return { success: "Task updated", refreshKey: Date.now() };
  },
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction(
  bulkDeleteTasksSchema,
  async ({ taskIds }): Promise<BulkDeleteTasksActionState> => {
    const deletedCount = await bulkDeleteTasks(taskIds);
    revalidatePath(routes.app.tasks);
    return {
      success:
        deletedCount === 1 ? "1 task deleted" : `${deletedCount} tasks deleted`,
      taskIds,
    };
  },
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction(
  bulkUpdateTaskStatusSchema,
  async (data): Promise<BulkUpdateTaskStatusActionState> => {
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
