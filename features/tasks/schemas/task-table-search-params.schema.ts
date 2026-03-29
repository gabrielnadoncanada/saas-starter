import {
  TASK_TABLE_DEFAULT_ORDER,
  TASK_TABLE_DEFAULT_PAGE,
  TASK_TABLE_DEFAULT_PAGE_SIZE,
  TASK_TABLE_DEFAULT_SORT,
  TASK_TABLE_PAGE_SIZES,
  TASK_TABLE_SORT_FIELDS,
} from "@/features/tasks/constants/task-table";
import { TaskPriority, TaskStatus } from "@/shared/lib/db/enums";
import { z } from "zod";

export type TaskTablePageSize = (typeof TASK_TABLE_PAGE_SIZES)[number];
export type TaskTableSortField = (typeof TASK_TABLE_SORT_FIELDS)[number];
export type TaskTableSearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

const taskTableSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(TASK_TABLE_DEFAULT_PAGE),
  pageSize: z
    .coerce.number()
    .int()
    .refine(
      (value): value is TaskTablePageSize =>
        TASK_TABLE_PAGE_SIZES.includes(value as TaskTablePageSize),
    )
    .default(TASK_TABLE_DEFAULT_PAGE_SIZE),
  q: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  sort: z.enum(TASK_TABLE_SORT_FIELDS).default(TASK_TABLE_DEFAULT_SORT),
  order: z.enum(["asc", "desc"]).default(TASK_TABLE_DEFAULT_ORDER),
  status: z.array(z.nativeEnum(TaskStatus)).default([]),
  priority: z.array(z.nativeEnum(TaskPriority)).default([]),
});

export type TaskTableSearchParams = z.output<
  typeof taskTableSearchParamsSchema
>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getListValue(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTaskTableSearchParams(
  input: TaskTableSearchParamsInput,
): TaskTableSearchParams {
  return taskTableSearchParamsSchema.parse({
    page: getFirstValue(input.page),
    pageSize: getFirstValue(input.pageSize),
    q: getFirstValue(input.q),
    sort: getFirstValue(input.sort),
    order: getFirstValue(input.order),
    status: getListValue(input.status),
    priority: getListValue(input.priority),
  });
}
