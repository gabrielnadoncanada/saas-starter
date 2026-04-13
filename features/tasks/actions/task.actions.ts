"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createTask,
  deleteTask,
  updateTask,
} from "@/features/tasks/server/task-mutations";
import {
  createTaskSchema,
  type CreateTaskValues,
  deleteTaskSchema,
  updateTaskSchema,
} from "@/features/tasks/task.schema";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
  task?: Task;
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
