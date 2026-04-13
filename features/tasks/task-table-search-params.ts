import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { TaskPriority, TaskStatus } from "@/lib/db/enums";

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

export const taskTableSearchParams = {
  page: parseAsInteger
    .withDefault(TASK_TABLE_DEFAULTS.page)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(TASK_TABLE_DEFAULTS.pageSize)
    .withOptions({ clearOnDefault: true }),
  q: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sort: parseAsStringLiteral(TASK_TABLE_SORT_FIELDS)
    .withDefault(TASK_TABLE_DEFAULTS.sort)
    .withOptions({ clearOnDefault: true }),
  order: parseAsStringLiteral(["asc", "desc"] as const)
    .withDefault(TASK_TABLE_DEFAULTS.order)
    .withOptions({ clearOnDefault: true }),
  status: parseAsArrayOf(parseAsStringLiteral(Object.values(TaskStatus)))
    .withDefault([])
    .withOptions({ clearOnDefault: true }),
  priority: parseAsArrayOf(parseAsStringLiteral(Object.values(TaskPriority)))
    .withDefault([])
    .withOptions({ clearOnDefault: true }),
};

export const loadTaskTableSearchParams = createLoader(taskTableSearchParams);
export const serializeTaskTableHref = createSerializer(taskTableSearchParams);

export type TaskTableSearchParams = Awaited<
  ReturnType<typeof loadTaskTableSearchParams>
>;

export function parseTaskTableSearchParams(
  input: Record<string, string | string[] | undefined>,
): TaskTableSearchParams {
  const parsed = loadTaskTableSearchParams(input);
  return {
    ...parsed,
    page: Math.max(1, parsed.page),
    pageSize: TASK_TABLE_PAGE_SIZES.includes(
      parsed.pageSize as (typeof TASK_TABLE_PAGE_SIZES)[number],
    )
      ? parsed.pageSize
      : TASK_TABLE_DEFAULTS.pageSize,
  };
}

export function buildTasksTableHref(
  pathname: string,
  params: TaskTableSearchParams,
) {
  return serializeTaskTableHref(pathname, params);
}
