import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react";
import { z } from "zod";

import {
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "@/shared/lib/db/enums";

// --- Schemas ---

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

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskValues = z.infer<typeof updateTaskSchema>;
export type BulkDeleteTasksValues = z.infer<typeof bulkDeleteTasksSchema>;
export type BulkUpdateTaskStatusValues = z.infer<
  typeof bulkUpdateTaskStatusSchema
>;

// --- Display options (labels, priorities, statuses) ---

export const taskLabels: { value: TaskLabel; label: string }[] = [
  { value: TaskLabel.BUG, label: "Bug" },
  { value: TaskLabel.FEATURE, label: "Feature" },
  { value: TaskLabel.DOCUMENTATION, label: "Documentation" },
];

export const taskPriorities: {
  value: TaskPriority;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: TaskPriority.LOW, label: "Low", icon: ArrowDown },
  { value: TaskPriority.MEDIUM, label: "Medium", icon: ArrowRight },
  { value: TaskPriority.HIGH, label: "High", icon: ArrowUp },
];

export const taskStatuses: {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: TaskStatus.BACKLOG, label: "Backlog", icon: HelpCircle },
  { value: TaskStatus.TODO, label: "Todo", icon: Circle },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress", icon: Timer },
  { value: TaskStatus.DONE, label: "Done", icon: CheckCircle },
  { value: TaskStatus.CANCELED, label: "Canceled", icon: CircleOff },
];
