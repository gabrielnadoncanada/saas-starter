"use client";

import { useMemo } from "react";

import {
  TASK_TABLE_PAGE_SIZES,
  type TaskTableSearchParams,
  buildTasksTableHref,
} from "@/features/tasks/schemas/task-table-params";
import type { Task } from "@/features/tasks/types/task.types";
import {
  DataTableContent,
  DataTablePagination,
} from "@/shared/components/data-table";
import { useServerTable } from "@/shared/hooks/use-server-table";
import { cn } from "@/shared/lib/utils";
import { getTasksColumns } from "./tasks-columns";
import { TasksBulkActions } from "./tasks-bulk-actions";
import { TasksTableToolbar } from "./tasks-table-toolbar";

type TasksTableProps = {
  tasksPage: TaskTableSearchParams & {
    rows: Task[];
    rowCount: number;
    pageCount: number;
  };
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
  const {
    rows,
    rowCount,
    pageCount,
    page,
    pageSize,
    q,
    sort,
    order,
    status,
    priority,
  } = tasksPage;
  const columns = useMemo(
    () => getTasksColumns({ onEditTask, onDeleteTask }),
    [onEditTask, onDeleteTask],
  );
  const tableParams = useMemo<TaskTableSearchParams>(
    () => ({ page, pageSize, q, sort, order, status, priority }),
    [order, page, pageSize, priority, q, sort, status],
  );
  const table = useServerTable({
    data: rows,
    columns,
    pageCount,
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
          {rowCount} task{rowCount === 1 ? "" : "s"}
        </p>
        <DataTablePagination table={table} className="mt-auto w-full px-0" />
      </div>

      <TasksBulkActions table={table} />
    </div>
  );
}
