'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/shared/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { priorities, statuses } from '../../constants'
import type { Task } from '../../types/task.types'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { getTasksColumns } from './tasks-columns'

type TaskColumnMeta = {
  className?: string
  thClassName?: string
  tdClassName?: string
}

type TasksTableProps = {
  onOpenDeleteDialog: (task: Task) => void
  onOpenUpdateDialog: (task: Task) => void
  tasks: Task[]
}

export function TasksTable({
  onOpenDeleteDialog,
  onOpenUpdateDialog,
  tasks,
}: TasksTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo(
    () =>
      getTasksColumns({
        onOpenDeleteDialog,
        onOpenUpdateDialog,
      }),
    [onOpenDeleteDialog, onOpenUpdateDialog]
  )

  const normalizedFilter = globalFilter.trim().toLowerCase()
  const filteredData = useMemo(() => {
    if (!normalizedFilter) {
      return tasks
    }

    return tasks.filter((task) => {
      return (
        task.code.toLowerCase().includes(normalizedFilter) ||
        task.title.toLowerCase().includes(normalizedFilter)
      )
    })
  }, [tasks, normalizedFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
  })
  const pageCount = table.getPageCount()

  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex > pageCount - 1) {
      setPagination((current) => ({
        ...current,
        pageIndex: pageCount - 1,
      }))
    }
  }, [pageCount, pagination.pageIndex])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by title or ID...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },
          {
            columnId: 'priority',
            title: 'Priority',
            options: priorities,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as TaskColumnMeta | undefined

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
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as TaskColumnMeta | undefined

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(meta?.className, meta?.tdClassName)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
