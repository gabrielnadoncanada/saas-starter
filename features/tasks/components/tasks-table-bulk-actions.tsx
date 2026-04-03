"use client";

import type { Task } from "@prisma/client";
import type { Table } from "@tanstack/react-table";
import { CircleArrowUp, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo, useState } from "react";

import {
  bulkDeleteTasksAction,
  type BulkDeleteTasksActionState,
  bulkUpdateTaskStatusAction,
  type BulkUpdateTaskStatusActionState,
} from "@/features/tasks/server/task-server-actions";
import { taskStatuses } from "@/features/tasks/task-options";
import { DataTableBulkActions } from "@/shared/components/data-table";
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { useRouter } from "@/shared/i18n/navigation";

type TasksBulkActionsProps = {
  table: Table<Task>;
};

function serializeTaskIds(tasks: Task[]) {
  return tasks.map((task) => task.id).join(",");
}

export function TasksBulkActions({ table }: TasksBulkActionsProps) {
  const router = useRouter();
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const selectedTasks = useMemo(
    () => table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    [table, table.getState().rowSelection],
  );
  const taskIds = serializeTaskIds(selectedTasks);
  const [statusState, statusAction, isStatusPending] = useActionState<
    BulkUpdateTaskStatusActionState,
    FormData
  >(bulkUpdateTaskStatusAction, {});
  const [deleteState, deleteAction, isDeletePending] = useActionState<
    BulkDeleteTasksActionState,
    FormData
  >(bulkDeleteTasksAction, {});

  useToastMessage(statusState.error, {
    kind: "error",
    skip: Boolean(statusState.fieldErrors),
    trigger: statusState,
  });
  useToastMessage(statusState.success, { kind: "success", trigger: statusState });
  useToastMessage(deleteState.error, {
    kind: "error",
    skip: Boolean(deleteState.fieldErrors),
    trigger: deleteState,
  });
  useToastMessage(deleteState.success, { kind: "success", trigger: deleteState });

  useEffect(() => {
    if (!statusState.success && !deleteState.success) {
      return;
    }

    router.refresh();
    table.resetRowSelection();
    setIsDeleteOpen(false);
  }, [deleteState.success, router, statusState.success, table]);

  return (
    <>
      <DataTableBulkActions table={table} entityName="task">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label={t("bulkUpdateStatus")}
                  disabled={isStatusPending || isDeletePending}
                >
                  {isStatusPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CircleArrowUp />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("bulkUpdateStatus")}</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent sideOffset={14}>
            {taskStatuses.map((status) => (
              <DropdownMenuItem key={status.value} asChild>
                <form action={statusAction} className="w-full">
                  <input type="hidden" name="taskIds" value={taskIds} />
                  <input type="hidden" name="status" value={status.value} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 text-left"
                    disabled={isStatusPending || isDeletePending}
                  >
                    {status.icon ? (
                      <status.icon className="size-4 text-muted-foreground" />
                    ) : null}
                    {status.label}
                  </button>
                </form>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setIsDeleteOpen(true)}
              className="size-8"
              aria-label={t("bulkDeleteTooltip")}
              disabled={isStatusPending || isDeletePending}
            >
              {isDeletePending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("bulkDeleteTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        handleConfirm={() => {
          const formData = new FormData();
          formData.set("taskIds", taskIds);
          deleteAction(formData);
        }}
        destructive
        isLoading={isDeletePending}
        title={t("bulkDeleteTitle", { count: selectedTasks.length })}
        desc={
          <div className="space-y-3">
            <p>{t("bulkDeleteMessage")}</p>
          </div>
        }
        confirmText={tc("delete")}
      />
    </>
  );
}
