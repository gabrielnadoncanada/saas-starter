import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";
import { z } from "zod";

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(255, "Title must be 255 characters or less");

const taskDescriptionSchema = z.string().trim().max(5000).optional();
const taskStatusSchema = z.nativeEnum(TaskStatus);
const taskLabelSchema = z.nativeEnum(TaskLabel);
const taskPrioritySchema = z.nativeEnum(TaskPriority);
const taskIdsSchema = z
  .string()
  .trim()
  .min(1, "Select at least one task")
  .transform((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  )
  .pipe(
    z
      .array(z.coerce.number().int().positive())
      .min(1, "Select at least one task"),
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

export const deleteTaskSchema = z.object({
  taskId: z.coerce.number().int().positive(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  status: taskStatusSchema,
});

export const bulkDeleteTasksSchema = z.object({
  taskIds: taskIdsSchema,
});

export const bulkUpdateTaskStatusSchema = z.object({
  taskIds: taskIdsSchema,
  status: taskStatusSchema,
});
