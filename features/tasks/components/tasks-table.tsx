"use client";

import type { Task } from "@prisma/client";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import {
  CircleArrowUp,
  Loader2,
  MoreHorizontalIcon,
  Trash2,
  XIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import {
  bulkDeleteTasksAction,
  type BulkDeleteTasksActionState,
  bulkUpdateTaskStatusAction,
  type BulkUpdateTaskStatusActionState,
} from "@/features/tasks/server/task-actions";
import {
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "@/features/tasks/task-options";
import {
  buildTasksTableHref,
  TASK_TABLE_PAGE_SIZES,
  type TaskTableSearchParams,
} from "@/features/tasks/task-schemas";
import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableContent,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableViewOptions,
} from "@/shared/components/data-table";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useServerTable } from "@/shared/hooks/use-server-table";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
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

function serializeTaskIds(tasks: Task[]) {
  return tasks.map((task) => task.id).join(",");
}

function TasksTableToolbar({
  params,
  table,
}: {
  params: TaskTableSearchParams;
  table: Table<Task>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(params.q ?? "");
  const isFiltered =
    Boolean(params.q) || table.getState().columnFilters.length > 0;

  useEffect(() => {
    setSearchValue(params.q ?? "");
  }, [params.q]);

  useEffect(() => {
    const nextQuery = searchValue.trim();
    const currentQuery = params.q ?? "";

    if (nextQuery === currentQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(
        buildTasksTableHref(pathname, {
          ...params,
          page: 1,
          q: nextQuery || undefined,
        }),
        { scroll: false },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [params, pathname, router, searchValue]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Filter by title or ID..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={taskStatuses}
          />
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={taskPriorities}
          />
        </div>

        {isFiltered ? (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchValue("");
              router.replace(
                buildTasksTableHref(pathname, {
                  ...params,
                  page: 1,
                  q: undefined,
                  status: [],
                  priority: [],
                }),
                { scroll: false },
              );
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ms-2 h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}

function TasksBulkActions({ table }: { table: Table<Task> }) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const selectedTasks = useMemo(
    () => table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    [table, table.getState().rowSelection],
  );
  const taskIds = serializeTaskIds(selectedTasks);
  const statusFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [statusState, statusAction, isStatusPending] = useActionState<
    BulkUpdateTaskStatusActionState,
    FormData
  >(bulkUpdateTaskStatusAction, {});
  const [deleteState, deleteAction, isDeletePending] = useActionState<
    BulkDeleteTasksActionState,
    FormData
  >(bulkDeleteTasksAction, {});

  useToastMessage(statusState.error, {
    kind: "error",
    skip: Boolean(statusState.fieldErrors),
    trigger: statusState,
  });
  useToastMessage(statusState.success, {
    kind: "success",
    trigger: statusState,
  });
  useToastMessage(deleteState.error, {
    kind: "error",
    skip: Boolean(deleteState.fieldErrors),
    trigger: deleteState,
  });
  useToastMessage(deleteState.success, {
    kind: "success",
    trigger: deleteState,
  });

  useEffect(() => {
    if (statusState.success || deleteState.success) {
      router.refresh();
      table.resetRowSelection();
      setIsDeleteOpen(false);
    }
  }, [deleteState.success, router, statusState.success, table]);

  return (
    <>
      <form ref={statusFormRef} action={statusAction} className="hidden">
        <input type="hidden" name="taskIds" value={taskIds} />
        <input type="hidden" name="status" value="" />
      </form>

      <form ref={deleteFormRef} action={deleteAction} className="hidden">
        <input type="hidden" name="taskIds" value={taskIds} />
      </form>

      <DataTableBulkActions table={table} entityName="task">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Update status"
                  disabled={isStatusPending || isDeletePending}
                >
                  {isStatusPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CircleArrowUp />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent sideOffset={14}>
            {taskStatuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => {
                  const statusInput =
                    statusFormRef.current?.elements.namedItem("status");

                  if (!(statusInput instanceof HTMLInputElement)) {
                    return;
                  }

                  statusInput.value = status.value;
                  statusFormRef.current?.requestSubmit();
                }}
              >
                {status.icon ? (
                  <status.icon className="size-4 text-muted-foreground" />
                ) : null}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setIsDeleteOpen(true)}
              className="size-8"
              aria-label="Delete selected tasks"
              disabled={isStatusPending || isDeletePending}
            >
              {isDeletePending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        handleConfirm={() => deleteFormRef.current?.requestSubmit()}
        destructive
        isLoading={isDeletePending}
        title={`Delete ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}?`}
        desc={
          <div className="space-y-3">
            <p>This action will permanently delete the selected tasks.</p>
          </div>
        }
        confirmText="Delete"
      />
    </>
  );
}

function TasksRowActions({
  row,
  onEditTask,
  onDeleteTask,
}: {
  row: Row<Task>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditTask(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDeleteTask(row.original)}>
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getTasksColumns({
  onEditTask,
  onDeleteTask,
}: {
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-[96px]">{row.getValue("code")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      meta: {
        className: "ps-1 max-w-0 w-2/3",
        tdClassName: "ps-4",
      },
      cell: ({ row }) => {
        const label = taskLabels.find(
          (option) => option.value === row.original.label,
        );

        return (
          <div className="flex space-x-2">
            {label ? <Badge variant="outline">{label.label}</Badge> : null}
            <span className="truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      meta: { className: "ps-1", tdClassName: "ps-4" },
      cell: ({ row }) => {
        const status = taskStatuses.find(
          (option) => option.value === row.getValue("status"),
        );

        if (!status) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center gap-2">
            <status.icon className="size-4 text-muted-foreground" />
            <span>{status.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      meta: { className: "ps-1", tdClassName: "ps-3" },
      cell: ({ row }) => {
        const priority = taskPriorities.find(
          (option) => option.value === row.getValue("priority"),
        );

        if (!priority) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <priority.icon className="size-4 text-muted-foreground" />
            <span>{priority.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <TasksRowActions
          row={row}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ),
    },
  ];
}

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
    [onDeleteTask, onEditTask],
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
