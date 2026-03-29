'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  functionalUpdate,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/utils'
import { TASK_TABLE_PAGE_SIZES } from '../../constants/task-table'
import {
  type TaskTableSearchParams,
  type TaskTableSortField,
} from '../../schemas/task-table-search-params.schema'
import type { Task } from '../../types/task.types'
import { buildTasksTableHref } from '../../utils/task-table-url'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { getTasksColumns } from './tasks-columns'
import { TasksTableContent } from './tasks-table-content'
import { TasksTablePagination } from './tasks-table-pagination'
import { TasksTableToolbar } from './tasks-table-toolbar'

type TasksTableProps = {
  order: TaskTableSearchParams['order']
  page: number
  pageCount: number
  pageSize: TaskTableSearchParams['pageSize']
  priority: TaskTableSearchParams['priority']
  q: TaskTableSearchParams['q']
  rowCount: number
  rows: Task[]
  sort: TaskTableSearchParams['sort']
  status: TaskTableSearchParams['status']
  onOpenDeleteDialog: (task: Task) => void
  onOpenUpdateDialog: (task: Task) => void
}

const sortableColumns = new Set<TaskTableSortField>(['title', 'status', 'priority'])

function isTaskTablePageSize(value: number): value is TaskTableSearchParams['pageSize'] {
  return TASK_TABLE_PAGE_SIZES.includes(value as TaskTableSearchParams['pageSize'])
}

function getFilterValues(
  filters: ColumnFiltersState,
  columnId: 'status' | 'priority'
) {
  const value = filters.find((filter) => filter.id === columnId)?.value

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export function TasksTable({
  order,
  page,
  pageCount,
  pageSize,
  priority,
  q,
  rowCount,
  rows,
  sort,
  status,
  onOpenDeleteDialog,
  onOpenUpdateDialog,
}: TasksTableProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns = useMemo(
    () =>
      getTasksColumns({
        onOpenDeleteDialog,
        onOpenUpdateDialog,
      }),
    [onOpenDeleteDialog, onOpenUpdateDialog]
  )
  const sorting = useMemo<SortingState>(
    () =>
      sortableColumns.has(sort)
        ? [
            {
              id: sort,
              desc: order === 'desc',
            },
          ]
        : [],
    [order, sort]
  )
  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      ...(status.length > 0 ? [{ id: 'status', value: status }] : []),
      ...(priority.length > 0 ? [{ id: 'priority', value: priority }] : []),
    ],
    [priority, status]
  )
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  )
  const tableParams = useMemo<TaskTableSearchParams>(
    () => ({
      page,
      pageSize,
      q,
      sort,
      order,
      status,
      priority,
    }),
    [order, page, pageSize, priority, q, sort, status]
  )

  useEffect(() => {
    setRowSelection({})
  }, [order, page, pageSize, priority, q, rowCount, sort, status])

  const table = useReactTable({
    data: rows,
    columns,
    pageCount,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    state: {
      rowSelection,
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter: q ?? '',
    },
    enableRowSelection: true,
    enableMultiSort: false,
    getRowId: (row) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const nextSorting = functionalUpdate(updater, sorting)
      const nextSort = nextSorting[0]

      if (!nextSort || !sortableColumns.has(nextSort.id as TaskTableSortField)) {
        router.replace(
          buildTasksTableHref(pathname, {
            ...tableParams,
            page: 1,
            sort: 'createdAt',
            order: 'desc',
          }),
          { scroll: false }
        )
        return
      }

      router.replace(
        buildTasksTableHref(pathname, {
          ...tableParams,
          page: 1,
          sort: nextSort.id as TaskTableSortField,
          order: nextSort.desc ? 'desc' : 'asc',
        }),
        { scroll: false }
      )
    },
    onPaginationChange: (updater) => {
      const nextPagination = functionalUpdate(updater, pagination)
      const nextPageSize = nextPagination.pageSize

      if (!isTaskTablePageSize(nextPageSize)) {
        return
      }

      router.replace(
        buildTasksTableHref(pathname, {
          ...tableParams,
          page: nextPageSize === pageSize ? nextPagination.pageIndex + 1 : 1,
          pageSize: nextPageSize,
        }),
        { scroll: false }
      )
    },
    onColumnFiltersChange: (updater) => {
      const nextFilters = functionalUpdate(updater, columnFilters)

      router.replace(
        buildTasksTableHref(pathname, {
          ...tableParams,
          page: 1,
          status: getFilterValues(nextFilters, 'status') as TasksTableProps['status'],
          priority: getFilterValues(nextFilters, 'priority') as TasksTableProps['priority'],
        }),
        { scroll: false }
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <TasksTableToolbar params={tableParams} table={table} />
      <TasksTableContent columnsLength={columns.length} table={table} />
      <div className='flex items-center justify-between gap-4'>
        <p className='text-sm text-muted-foreground'>
          {rowCount} task{rowCount === 1 ? '' : 's'}
        </p>
        <TasksTablePagination table={table} className='mt-auto w-full px-0' />
      </div>
      <DataTableBulkActions table={table} />
    </div>
  )
}
