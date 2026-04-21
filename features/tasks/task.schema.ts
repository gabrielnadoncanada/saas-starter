import { z } from "zod";

import { TaskLabel, TaskPriority, TaskStatus } from "@/lib/db/enums";

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, { message: "Title is required" })
  .max(255, { message: "Title must be 255 characters or less" });

const taskDescriptionSchema = z.string().trim().max(5000).optional();
const taskStatusSchema = z.nativeEnum(TaskStatus);
const taskLabelSchema = z.nativeEnum(TaskLabel);
const taskPrioritySchema = z.nativeEnum(TaskPriority);
const taskIdsSchema = z
  .string()
  .trim()
  .min(1, { message: "Select at least one task" })
  .transform((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.coerce.number().int().positive())
      .min(1, { message: "Select at least one task" }),
  );

const taskIdSchema = z.coerce.number().int().positive();

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema.default(TaskLabel.FEATURE),
  priority: taskPrioritySchema.default(TaskPriority.MEDIUM),
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: taskIdSchema,
  label: taskLabelSchema,
  priority: taskPrioritySchema,
  status: taskStatusSchema,
});

export const deleteTaskSchema = z.object({
  taskId: taskIdSchema,
});

export const updateTaskStatusSchema = z.object({
  taskId: taskIdSchema,
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
export type UpdateTaskStatusValues = z.infer<typeof updateTaskStatusSchema>;
export type BulkDeleteTasksValues = z.infer<typeof bulkDeleteTasksSchema>;
export type BulkUpdateTaskStatusValues = z.infer<
  typeof bulkUpdateTaskStatusSchema
>;
