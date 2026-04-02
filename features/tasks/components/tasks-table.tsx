"use client";

import type { Task } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { TasksBulkActions } from "@/features/tasks/components/tasks-table-bulk-actions";
import { getTasksColumns } from "@/features/tasks/components/tasks-table-columns";
import { TasksTableToolbar } from "@/features/tasks/components/tasks-table-toolbar";
import {
  buildTasksTableHref,
  TASK_TABLE_PAGE_SIZES,
  type TaskTableSearchParams,
} from "@/features/tasks/task-table-search-params";
import {
  DataTableContent,
  DataTablePagination,
} from "@/shared/components/data-table";
import { useServerTable } from "@/shared/hooks/use-server-table";
import { cn } from "@/shared/lib/utils";

type TasksPageData = TaskTableSearchParams & {
  rows: Task[];
  rowCount: number;
  pageCount: number;
};

type TasksTableProps = {
  tasksPage: TasksPageData;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
};

const sortableColumns = ["title", "status", "priority"];
const filterColumns = [
  { columnId: "status", paramKey: "status" },
  { columnId: "priority", paramKey: "priority" },
];

export function TasksTable({
  tasksPage,
  onEditTask,
  onDeleteTask,
}: TasksTableProps) {
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const columns = useMemo(
    () => getTasksColumns({ onEditTask, onDeleteTask, t, tc }),
    [onDeleteTask, onEditTask, t, tc],
  );
  const tableParams = useMemo<TaskTableSearchParams>(
    () => ({
      page: tasksPage.page,
      pageSize: tasksPage.pageSize,
      q: tasksPage.q,
      sort: tasksPage.sort,
      order: tasksPage.order,
      status: tasksPage.status,
      priority: tasksPage.priority,
    }),
    [tasksPage],
  );

  const table = useServerTable({
    data: tasksPage.rows,
    columns,
    pageCount: tasksPage.pageCount,
    params: tableParams,
    buildHref: buildTasksTableHref,
    sortableColumns,
    filterColumns,
    pageSizes: TASK_TABLE_PAGE_SIZES,
    getRowId: (task) => task.id.toString(),
  });

  return (
    <div
      className={cn(
        "max-sm:has-[div[role='toolbar']]:mb-16",
        "flex flex-1 flex-col gap-4",
      )}
    >
      <TasksTableToolbar params={tableParams} table={table} />
      <DataTableContent table={table} tableClassName="min-w-xl" />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("rowCount", { count: tasksPage.rowCount })}
        </p>
        <DataTablePagination table={table} className="mt-auto w-full px-0" />
      </div>

      <TasksBulkActions table={table} />
    </div>
  );
}
