"use client";

import type { Task } from "@prisma/client";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontalIcon, Trash2 } from "lucide-react";

import {
  taskLabels,
  taskPriorities,
  taskStatuses,
} from "@/features/tasks/task.schema";
import { DataTableColumnHeader } from "@/shared/components/data-table";
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

type TasksTableColumnsOptions = {
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
};

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

export function getTasksColumns({
  onEditTask,
  onDeleteTask,
}: TasksTableColumnsOptions): ColumnDef<Task>[] {
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
      meta: { className: "ps-1 max-w-0 w-2/3", tdClassName: "ps-4" },
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
