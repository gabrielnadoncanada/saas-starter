"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { CircleArrowUp, Loader2, Trash2 } from 'lucide-react';

import { bulkDeleteTasksAction } from '@/features/tasks/actions/delete-task.action';
import { bulkUpdateTaskStatusAction } from '@/features/tasks/actions/update-task.action';
import { statuses } from '@/features/tasks/constants';
import { ConfirmDialog } from '@/shared/components/dialogs/ConfirmDialog';
import { DataTableBulkActions as BulkActionsToolbar } from '@/shared/components/data-table';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

import type { Task } from '../types/task.types';

type DataTableBulkActionsProps = {
  table: Table<Task>;
};

function serializeTaskIds(tasks: Task[]) {
  return tasks.map((task) => task.id).join(',');
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const selectedTasks = useMemo(
    () => table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    [table, table.getState().rowSelection]
  );
  const taskIds = serializeTaskIds(selectedTasks);
  const statusFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [state, statusAction, isStatusPending] = useActionState(
    bulkUpdateTaskStatusAction,
    {}
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    bulkDeleteTasksAction,
    {}
  );

  useEffect(() => {
    if (state.success || deleteState.success) {
      table.resetRowSelection();
      setIsDeleteOpen(false);
    }
  }, [deleteState.success, state.success, table]);

  return (
    <>
      <form ref={statusFormRef} action={statusAction} className='hidden'>
        <input type='hidden' name='taskIds' value={taskIds} />
        <input type='hidden' name='status' value='' />
      </form>

      <form ref={deleteFormRef} action={deleteAction} className='hidden'>
        <input type='hidden' name='taskIds' value={taskIds} />
      </form>

      <BulkActionsToolbar table={table} entityName='task'>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  disabled={isStatusPending || isDeletePending}
                >
                  {isStatusPending ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    <CircleArrowUp />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => {
                  const statusInput = statusFormRef.current?.elements.namedItem('status');

                  if (!(statusInput instanceof HTMLInputElement)) {
                    return;
                  }

                  statusInput.value = status.value;
                  statusFormRef.current?.requestSubmit();
                }}
              >
                {status.icon ? <status.icon className='size-4 text-muted-foreground' /> : null}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setIsDeleteOpen(true)}
              className='size-8'
              aria-label='Delete selected tasks'
              disabled={isStatusPending || isDeletePending}
            >
              {isDeletePending ? <Loader2 className='animate-spin' /> : <Trash2 />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        handleConfirm={() => deleteFormRef.current?.requestSubmit()}
        destructive
        isLoading={isDeletePending}
        title={`Delete ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}?`}
        desc={
          <div className='space-y-3'>
            <p>This action will permanently delete the selected tasks.</p>
            {deleteState.error ? (
              <p className='text-sm text-destructive'>{deleteState.error}</p>
            ) : null}
          </div>
        }
        confirmText='Delete'
      />
    </>
  );
}
