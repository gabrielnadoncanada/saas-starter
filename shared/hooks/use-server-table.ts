"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  functionalUpdate,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { useEffect, useState } from "react";

// --- Types ---

type FilterColumn = {
  columnId: string;
  paramKey: string;
};

type BaseTableParams = {
  page: number;
  pageSize: number;
  q?: string;
  sort: string;
  order: "asc" | "desc";
};

type UseServerTableOptions<TData, TParams extends BaseTableParams> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageCount: number;
  params: TParams;
  buildHref: (pathname: string, params: TParams) => string;
  sortableColumns?: string[];
  defaultSort?: string;
  defaultOrder?: "asc" | "desc";
  filterColumns?: FilterColumn[];
  pageSizes?: readonly number[];
  getRowId?: (row: TData) => string;
};

// --- Hook ---

export function useServerTable<TData, TParams extends BaseTableParams>({
  data,
  columns,
  pageCount,
  params,
  buildHref,
  sortableColumns = [],
  defaultSort = "createdAt",
  defaultOrder = "desc",
  filterColumns = [],
  pageSizes = [10, 20, 30, 40, 50],
  getRowId,
}: UseServerTableOptions<TData, TParams>): Table<TData> {
  const pathname = usePathname();
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const paramsKey = JSON.stringify(params);
  const sortableSet = new Set(sortableColumns);
  const sorting: SortingState = sortableSet.has(params.sort)
    ? [{ id: params.sort, desc: params.order === "desc" }]
    : [];
  const columnFilters: ColumnFiltersState = filterColumns.flatMap(
    ({ columnId, paramKey }) => {
      const value = (params as Record<string, unknown>)[paramKey];
      return Array.isArray(value) && value.length > 0
        ? [{ id: columnId, value }]
        : [];
    },
  );
  const pagination: PaginationState = {
    pageIndex: params.page - 1,
    pageSize: params.pageSize,
  };

  useEffect(() => setRowSelection({}), [data, paramsKey]);

  function navigate(nextParams: TParams) {
    router.replace(buildHref(pathname, nextParams), { scroll: false });
  }

  function extractFilterValues(
    filters: ColumnFiltersState,
    id: string,
  ): string[] {
    const value = filters.find((f) => f.id === id)?.value;
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  }

  return useReactTable({
    data,
    columns,
    pageCount,
    meta: {
      pageSizes,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    state: {
      rowSelection,
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter: params.q ?? "",
    },
    enableRowSelection: true,
    enableMultiSort: false,
    getRowId:
      getRowId ?? ((row) => String((row as Record<string, unknown>).id)),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const nextSorting = functionalUpdate(updater, sorting);
      const nextSort = nextSorting[0];

      if (!nextSort || !sortableSet.has(nextSort.id)) {
        navigate({
          ...params,
          page: 1,
          sort: defaultSort,
          order: defaultOrder,
        } as TParams);
        return;
      }

      navigate({
        ...params,
        page: 1,
        sort: nextSort.id,
        order: nextSort.desc ? "desc" : "asc",
      } as TParams);
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (!pageSizes.includes(next.pageSize)) return;

      navigate({
        ...params,
        page: next.pageSize === params.pageSize ? next.pageIndex + 1 : 1,
        pageSize: next.pageSize,
      } as TParams);
    },
    onColumnFiltersChange: (updater) => {
      const next = functionalUpdate(updater, columnFilters);
      const patch: Record<string, string[]> = {};
      for (const { columnId, paramKey } of filterColumns) {
        patch[paramKey] = extractFilterValues(next, columnId);
      }
      navigate({ ...params, page: 1, ...patch } as TParams);
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
}

