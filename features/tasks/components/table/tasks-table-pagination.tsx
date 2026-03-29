import { type Table } from "@tanstack/react-table";

import { DataTablePagination } from "@/shared/components/data-table";

type TasksTablePaginationProps<TData> = {
  table: Table<TData>;
  className?: string;
};

export function TasksTablePagination<TData>({
  table,
  className,
}: TasksTablePaginationProps<TData>) {
  return <DataTablePagination table={table} className={className} />;
}
