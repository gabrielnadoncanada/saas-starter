import { z } from 'zod';

const taskTitleSchema = z.string().trim().min(1, 'Title is required').max(255);
const taskDescriptionSchema = z.string().trim().max(5000).optional();
const taskStatusSchema = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']);
const taskLabelSchema = z.enum(['FEATURE', 'BUG', 'DOCUMENTATION']);
const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const taskIdsSchema = z
  .string()
  .trim()
  .min(1, 'Select at least one task')
  .transform((value) => value.split(',').map((part) => part.trim()).filter(Boolean))
  .pipe(z.array(z.coerce.number().int().positive()).min(1, 'Select at least one task'));

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema,
  priority: taskPrioritySchema.default('MEDIUM')
});

export const updateTaskSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: taskLabelSchema,
  priority: taskPrioritySchema,
  status: taskStatusSchema
});

export const deleteTaskSchema = z.object({
  taskId: z.coerce.number().int().positive()
});

export const updateTaskStatusSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  status: taskStatusSchema
});

export const bulkDeleteTasksSchema = z.object({
  taskIds: taskIdsSchema
});

export const bulkUpdateTaskStatusSchema = z.object({
  taskIds: taskIdsSchema,
  status: taskStatusSchema
});
