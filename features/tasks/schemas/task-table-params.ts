import { z } from "zod";

import { TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

export const TASK_TABLE_PAGE_SIZES = [10, 20, 30, 40, 50] as const;
export const TASK_TABLE_SORT_FIELDS = [
  "createdAt",
  "title",
  "status",
  "priority",
] as const;

export const TASK_TABLE_DEFAULTS = {
  page: 1,
  pageSize: 10,
  sort: "createdAt",
  order: "desc",
} as const;

export type TaskTablePageSize = (typeof TASK_TABLE_PAGE_SIZES)[number];
export type TaskTableSortField = (typeof TASK_TABLE_SORT_FIELDS)[number];

const taskTableSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(TASK_TABLE_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .refine(
      (value): value is TaskTablePageSize =>
        TASK_TABLE_PAGE_SIZES.includes(value as TaskTablePageSize),
    )
    .catch(TASK_TABLE_DEFAULTS.pageSize),
  q: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  sort: z.enum(TASK_TABLE_SORT_FIELDS).catch(TASK_TABLE_DEFAULTS.sort),
  order: z.enum(["asc", "desc"]).catch(TASK_TABLE_DEFAULTS.order),
  status: z.array(z.nativeEnum(TaskStatus)).catch([]),
  priority: z.array(z.nativeEnum(TaskPriority)).catch([]),
});

export type TaskTableSearchParams = z.output<
  typeof taskTableSearchParamsSchema
>;

function toSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toList(value: string | string[] | undefined) {
  if (!value) return [];

  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTaskTableSearchParams(
  input: Record<string, string | string[] | undefined>,
) {
  return {
    page: toSingle(input.page),
    pageSize: toSingle(input.pageSize),
    q: toSingle(input.q),
    sort: toSingle(input.sort),
    order: toSingle(input.order),
    status: toList(input.status),
    priority: toList(input.priority),
  };
}

export function parseTaskTableSearchParams(
  input: Record<string, string | string[] | undefined>,
): TaskTableSearchParams {
  return taskTableSearchParamsSchema.parse(
    normalizeTaskTableSearchParams(input),
  );
}

export function buildTasksTableHref(
  pathname: string,
  params: TaskTableSearchParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.page > TASK_TABLE_DEFAULTS.page) {
    searchParams.set("page", params.page.toString());
  }

  if (params.pageSize !== TASK_TABLE_DEFAULTS.pageSize) {
    searchParams.set("pageSize", params.pageSize.toString());
  }

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.sort !== TASK_TABLE_DEFAULTS.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.order !== TASK_TABLE_DEFAULTS.order) {
    searchParams.set("order", params.order);
  }

  if (params.status.length > 0) {
    searchParams.set("status", params.status.join(","));
  }

  if (params.priority.length > 0) {
    searchParams.set("priority", params.priority.join(","));
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}