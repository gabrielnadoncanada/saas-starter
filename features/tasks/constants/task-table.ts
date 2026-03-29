export const TASK_TABLE_PAGE_SIZES = [10, 20, 30, 40, 50] as const;
export const TASK_TABLE_SORT_FIELDS = [
  "createdAt",
  "title",
  "status",
  "priority",
] as const;
export const TASK_TABLE_DEFAULT_PAGE = 1;
export const TASK_TABLE_DEFAULT_PAGE_SIZE = 10;
export const TASK_TABLE_DEFAULT_SORT = "createdAt" as const;
export const TASK_TABLE_DEFAULT_ORDER = "desc" as const;
