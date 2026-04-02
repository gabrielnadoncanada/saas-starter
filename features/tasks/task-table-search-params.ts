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

const taskTableSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(TASK_TABLE_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .catch(TASK_TABLE_DEFAULTS.pageSize)
    .transform((value) =>
      TASK_TABLE_PAGE_SIZES.includes(value as TaskTablePageSize)
        ? (value as TaskTablePageSize)
        : TASK_TABLE_DEFAULTS.pageSize,
    ),
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
  input: Record<string, string | string[] | undefined>,
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

export function buildTasksTableHref(
  pathname: string,
  params: TaskTableSearchParams,
) {
  const searchParams = new URLSearchParams();

  if (params.page !== TASK_TABLE_DEFAULTS.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== TASK_TABLE_DEFAULTS.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
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
