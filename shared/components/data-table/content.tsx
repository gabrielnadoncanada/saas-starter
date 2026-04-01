"use client";

import { flexRender, type Table as TableInstance } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type ColumnMeta = {
  className?: string;
  thClassName?: string;
  tdClassName?: string;
};

type DataTableContentProps<TData> = {
  table: TableInstance<TData>;
  className?: string;
  tableClassName?: string;
};

export function DataTableContent<TData>({
  table,
  className,
  tableClassName,
}: DataTableContentProps<TData>) {
  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table className={tableClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | ColumnMeta
                  | undefined;
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(meta?.className, meta?.thClassName)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | ColumnMeta
                    | undefined;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(meta?.className, meta?.tdClassName)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
