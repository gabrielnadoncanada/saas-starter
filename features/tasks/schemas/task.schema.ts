import { z } from 'zod';

const taskTitleSchema = z.string().trim().min(1, 'Title is required').max(255);
const taskDescriptionSchema = z.string().trim().max(5000).optional();

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: z.enum(['FEATURE', 'BUG', 'DOCUMENTATION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
});

export const updateTaskSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  label: z.enum(['FEATURE', 'BUG', 'DOCUMENTATION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'])
});

export const deleteTaskSchema = z.object({
  taskId: z.coerce.number().int().positive()
});

export const updateTaskStatusSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'])
});
