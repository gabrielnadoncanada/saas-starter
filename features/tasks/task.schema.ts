import { z } from "zod";

import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, { message: "Title is required" })
  .max(255, { message: "Title must be 255 characters or less" });

const taskDescriptionSchema = z.string().trim().max(5000).optional();
const taskStatusSchema = z.nativeEnum(TaskStatus);
const taskLabelSchema = z.nativeEnum(TaskLabel);
const taskPrioritySchema = z.nativeEnum(TaskPriority);

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema.default(TaskLabel.FEATURE),
  priority: taskPrioritySchema.default(TaskPriority.MEDIUM),
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

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
