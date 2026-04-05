import { z } from "zod";

import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, { message: "titleRequired" })
  .max(255, { message: "titleMaxLength" });

const taskDescriptionSchema = z.string().trim().max(5000).optional();
const taskStatusSchema = z.nativeEnum(TaskStatus);
const taskLabelSchema = z.nativeEnum(TaskLabel);
const taskPrioritySchema = z.nativeEnum(TaskPriority);
const taskIdsSchema = z
  .string()
  .trim()
  .min(1, { message: "selectTaskRequired" })
  .transform((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.coerce.number().int().positive())
      .min(1, { message: "selectTaskRequired" }),
  );

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema,
  priority: taskPrioritySchema.default("MEDIUM"),
});

export const updateTaskSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema,
  priority: taskPrioritySchema,
  status: taskStatusSchema,
});

export const bulkDeleteTasksSchema = z.object({
  taskIds: taskIdsSchema,
});

export const bulkUpdateTaskStatusSchema = z.object({
  taskIds: taskIdsSchema,
  status: taskStatusSchema,
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
export type BulkDeleteTasksValues = z.infer<typeof bulkDeleteTasksSchema>;
export type BulkUpdateTaskStatusValues = z.infer<
  typeof bulkUpdateTaskStatusSchema
>;
