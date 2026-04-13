"use client";

import type { Task } from "@prisma/client";
import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { taskPriorities, taskStatuses } from "@/features/tasks/task-display";
import { taskTableSearchParams } from "@/features/tasks/task-table-search-params";

type TasksTableToolbarProps = {
  table: Table<Task>;
};

export function TasksTableToolbar({ table }: TasksTableToolbarProps) {
  const [{ q }, setQueryState] = useQueryStates(
    {
      q: taskTableSearchParams.q,
      page: taskTableSearchParams.page,
    },
    { shallow: false, throttleMs: 300 },
  );

  const isFiltered = Boolean(q) || table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={"Filter by title or ID..."}
          value={q}
          onChange={(event) =>
            setQueryState({ q: event.target.value, page: 1 })
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title={"Status"}
            options={taskStatuses}
          />
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title={"Priority"}
            options={taskPriorities}
          />
        </div>

        {isFiltered ? (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              void setQueryState({ q: "", page: 1 });
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
