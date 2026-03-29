'use client'

import { type Table as TableInstance, flexRender } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'

import type { Task } from '../../types/task.types'

type TaskColumnMeta = {
  className?: string
  thClassName?: string
  tdClassName?: string
}

type TasksTableContentProps = {
  columnsLength: number
  table: TableInstance<Task>
}

export function TasksTableContent({
  columnsLength,
  table,
}: TasksTableContentProps) {
  return (
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
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as TaskColumnMeta | undefined

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(meta?.className, meta?.tdClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
