import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";

import { labels } from "../constants/labels";
import { priorities } from "../constants/priorities";
import { statuses } from "../constants/statuses";
import type { Task } from "../types/task.types";
import { TasksRowActions } from "./tasks-row-actions";

type TasksColumnsOptions = {
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
};

export function getTasksColumns({
  onEditTask,
  onDeleteTask,
}: TasksColumnsOptions): ColumnDef<Task>[] {
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
        const label = labels.find(
          (label) => label.value === row.original.label,
        );

        return (
          <div className="flex space-x-2">
            {label && <Badge variant="outline">{label.label}</Badge>}
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
        const status = statuses.find(
          (status) => status.value === row.getValue("status"),
        );

        if (!status) return null;

        return (
          <div className="flex w-[100px] items-center gap-2">
            {status.icon && (
              <status.icon className="size-4 text-muted-foreground" />
            )}
            <span>{status.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      meta: { className: "ps-1", tdClassName: "ps-3" },
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue("priority"),
        );

        if (!priority) return null;

        return (
          <div className="flex items-center gap-2">
            {priority.icon && (
              <priority.icon className="size-4 text-muted-foreground" />
            )}
            <span>{priority.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <TasksRowActions
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          row={row}
        />
      ),
    },
  ];
}
