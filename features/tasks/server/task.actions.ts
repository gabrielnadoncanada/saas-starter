"use server";

import type { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
import { createNotification } from "@/features/notifications/server/notification-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import {
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  createTaskForCurrentOrganization,
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "@/features/tasks/server/task-mutations";
import {
  bulkDeleteTasksSchema,
  type BulkDeleteTasksValues,
  bulkUpdateTaskStatusSchema,
  type BulkUpdateTaskStatusValues,
  createTaskSchema,
  type CreateTaskValues,
  deleteTaskSchema,
  type DeleteTaskValues,
  updateTaskSchema,
  updateTaskStatusSchema,
  type UpdateTaskValues,
} from "@/features/tasks/task-form.schema";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
  task?: Task;
};

export type UpdateTaskActionState = FormActionState<UpdateTaskValues>;
export type DeleteTaskActionState = FormActionState<DeleteTaskValues> & {
  taskId?: number;
};

export type BulkDeleteTasksActionState = FormActionState<BulkDeleteTasksValues> & {
  taskIds?: number[];
};

export type BulkUpdateTaskStatusActionState =
  FormActionState<BulkUpdateTaskStatusValues> & {
  status?: Task["status"];
  taskIds?: number[];
};

const taskActionOptions = { validationNamespace: "tasks" } as const;

export const createTaskAction = validatedAuthenticatedAction<
  typeof createTaskSchema,
  { task?: Task }
>(
  createTaskSchema,
  async (data, _, user) => {
    const t = await getTranslations("tasks");

    try {
      const task = await createTaskForCurrentOrganization(data);
      const membership = await requireActiveOrganizationMembership();

      await Promise.all([
        recordAuditLog({
          organizationId: membership.organizationId,
          actorUserId: user.id,
          event: "task.created",
          entityType: "task",
          entityId: String(task.id),
          summary: `Created task ${task.code}`,
        }),
        createNotification({
          organizationId: membership.organizationId,
          userId: user.id,
          type: "task.created",
          title: t("notification.createdTitle"),
          body: t("notification.createdBody", { code: task.code }),
          href: routes.app.tasks,
          metadata: { taskId: task.id },
        }),
      ]);

      revalidatePath(routes.app.tasks);

      return {
        success: t("toast.created"),
        task,
      };
    } catch (error) {
      if (
        error instanceof UpgradeRequiredError ||
        error instanceof LimitReachedError ||
        (error instanceof Error && error.message === "Organization not found")
      ) {
        return { error: error.message };
      }

      throw error;
    }
  },
  taskActionOptions,
);

export const updateTaskAction = validatedAuthenticatedAction<
  typeof updateTaskSchema,
  {}
>(
  updateTaskSchema,
  async (data, _, user) => {
    const t = await getTranslations("tasks");
    await updateTask(data);
    const membership = await requireActiveOrganizationMembership();

    await recordAuditLog({
      organizationId: membership.organizationId,
      actorUserId: user.id,
      event: "task.updated",
      entityType: "task",
      entityId: String(data.taskId),
      summary: `Updated task ${data.taskId}`,
    });

    revalidatePath(routes.app.tasks);

    return { success: t("toast.updated") };
  },
  taskActionOptions,
);

export const deleteTaskAction = validatedAuthenticatedAction<
  typeof deleteTaskSchema,
  { taskId?: number }
>(
  deleteTaskSchema,
  async ({ taskId }, _, user) => {
    const t = await getTranslations("tasks");
    await deleteTask(taskId);
    const membership = await requireActiveOrganizationMembership();

    await Promise.all([
      recordAuditLog({
        organizationId: membership.organizationId,
        actorUserId: user.id,
        event: "task.deleted",
        entityType: "task",
        entityId: String(taskId),
        summary: `Deleted task ${taskId}`,
      }),
      createNotification({
        organizationId: membership.organizationId,
        userId: user.id,
        type: "task.deleted",
        title: t("notification.deletedTitle"),
        body: t("notification.deletedBody", { id: taskId }),
        href: routes.app.tasks,
        metadata: { taskId },
      }),
    ]);

    revalidatePath(routes.app.tasks);

    return {
      success: t("toast.deleted"),
      taskId,
    };
  },
  taskActionOptions,
);

export const updateTaskStatusAction = validatedAuthenticatedAction<
  typeof updateTaskStatusSchema,
  { refreshKey?: number }
>(
  updateTaskStatusSchema,
  async (data, _, user) => {
    const t = await getTranslations("tasks");
    await updateTaskStatus(data);
    const membership = await requireActiveOrganizationMembership();

    await recordAuditLog({
      organizationId: membership.organizationId,
      actorUserId: user.id,
      event: "task.status_updated",
      entityType: "task",
      entityId: String(data.taskId),
      summary: `Moved task ${data.taskId} to ${data.status}`,
    });

    revalidatePath(routes.app.tasks);

    return {
      success: t("toast.updated"),
      refreshKey: Date.now(),
    };
  },
  taskActionOptions,
);

export const bulkDeleteTasksAction = validatedAuthenticatedAction<
  typeof bulkDeleteTasksSchema,
  { taskIds?: number[] }
>(
  bulkDeleteTasksSchema,
  async ({ taskIds }, _, user) => {
    const t = await getTranslations("tasks");
    const deletedCount = await bulkDeleteTasks(taskIds);
    const membership = await requireActiveOrganizationMembership();

    await recordAuditLog({
      organizationId: membership.organizationId,
      actorUserId: user.id,
      event: "task.bulk_deleted",
      entityType: "task",
      summary: `Deleted ${deletedCount} tasks`,
      metadata: { taskIds },
    });

    revalidatePath(routes.app.tasks);

    return {
      success: t("toast.bulkDeleted", { count: deletedCount }),
      taskIds,
    };
  },
  taskActionOptions,
);

export const bulkUpdateTaskStatusAction = validatedAuthenticatedAction<
  typeof bulkUpdateTaskStatusSchema,
  { status?: Task["status"]; taskIds?: number[] }
>(
  bulkUpdateTaskStatusSchema,
  async (data, _, user) => {
    const t = await getTranslations("tasks");
    const updatedCount = await bulkUpdateTaskStatus(data);
    const membership = await requireActiveOrganizationMembership();

    await recordAuditLog({
      organizationId: membership.organizationId,
      actorUserId: user.id,
      event: "task.bulk_status_updated",
      entityType: "task",
      summary: `Updated ${updatedCount} tasks to ${data.status}`,
      metadata: { taskIds: data.taskIds },
    });

    revalidatePath(routes.app.tasks);

    return {
      success: t("toast.bulkUpdated", { count: updatedCount }),
      status: data.status,
      taskIds: data.taskIds,
    };
  },
  taskActionOptions,
);
