import type { Task } from "@prisma/client";
import { z } from "zod";

import {
  bulkDeleteTasksSchema,
  bulkUpdateTaskStatusSchema,
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
} from "@/features/tasks/task-schemas";
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