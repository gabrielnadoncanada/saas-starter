import {
  TASK_TABLE_DEFAULT_ORDER,
  TASK_TABLE_DEFAULT_PAGE,
  TASK_TABLE_DEFAULT_PAGE_SIZE,
  TASK_TABLE_DEFAULT_SORT,
} from "@/features/tasks/constants/task-table";
import type { TaskTableSearchParams } from "@/features/tasks/schemas/task-table-search-params.schema";

export function createTaskTableSearchParams(
  params: TaskTableSearchParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.page > TASK_TABLE_DEFAULT_PAGE) {
    searchParams.set("page", params.page.toString());
  }

  if (params.pageSize !== TASK_TABLE_DEFAULT_PAGE_SIZE) {
    searchParams.set("pageSize", params.pageSize.toString());
  }

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.sort !== TASK_TABLE_DEFAULT_SORT) {
    searchParams.set("sort", params.sort);
  }

  if (params.order !== TASK_TABLE_DEFAULT_ORDER) {
    searchParams.set("order", params.order);
  }

  if (params.status.length > 0) {
    searchParams.set("status", params.status.join(","));
  }

  if (params.priority.length > 0) {
    searchParams.set("priority", params.priority.join(","));
  }

  return searchParams;
}

export function buildTasksTableHref(
  pathname: string,
  params: TaskTableSearchParams,
) {
  const searchParams = createTaskTableSearchParams(params);
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
