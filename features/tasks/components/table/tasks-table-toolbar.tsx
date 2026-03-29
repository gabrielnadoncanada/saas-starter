"use client";

import { type Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { priorities, statuses } from "@/features/tasks/constants";
import {
  type TaskTableSearchParams,
} from "@/features/tasks/schemas/task-table-search-params.schema";
import type { Task } from "@/features/tasks/types/task.types";
import { buildTasksTableHref } from "@/features/tasks/utils/task-table-url";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/shared/components/data-table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type TasksTableToolbarProps = {
  params: TaskTableSearchParams;
  table: Table<Task>;
};

export function TasksTableToolbar({
  params,
  table,
}: TasksTableToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(params.q ?? "");
  const statusKey = params.status.join(",");
  const priorityKey = params.priority.join(",");
  const currentParams = useMemo(
    () => params,
    [
      params.order,
      params.page,
      params.pageSize,
      params.q,
      params.sort,
      priorityKey,
      statusKey,
    ],
  );
  const isFiltered = Boolean(params.q) || table.getState().columnFilters.length > 0;

  useEffect(() => {
    setSearchValue(params.q ?? "");
  }, [params.q]);

  useEffect(() => {
    const nextQuery = searchValue.trim();
    const currentQuery = currentParams.q ?? "";

    if (nextQuery === currentQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(
        buildTasksTableHref(pathname, {
          ...currentParams,
          page: 1,
          q: nextQuery || undefined,
        }),
        { scroll: false },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [currentParams, pathname, router, searchValue]);

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
            options={statuses}
          />
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        </div>
        {isFiltered ? (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchValue("");
              router.replace(
                buildTasksTableHref(pathname, {
                  ...currentParams,
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
