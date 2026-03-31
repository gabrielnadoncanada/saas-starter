import "server-only";

import { Prisma } from "@prisma/client";

import { requireCurrentOrganizationId } from "@/features/organizations/server/require-current-organization-id";
import type { TaskTableSearchParams } from "@/features/tasks/schemas/task-table-params";
import { db } from "@/shared/lib/db/prisma";

function getTaskOrderBy(
  sort: TaskTableSearchParams["sort"],
  order: TaskTableSearchParams["order"],
): Prisma.TaskOrderByWithRelationInput {
  switch (sort) {
    case "title":
      return { title: order };
    case "status":
      return { status: order };
    case "priority":
      return { priority: order };
    case "createdAt":
    default:
      return { createdAt: order };
  }
}

function getTaskWhereInput(
  organizationId: string,
  params: TaskTableSearchParams,
): Prisma.TaskWhereInput {
  return {
    organizationId,
    ...(params.q
      ? {
          OR: [
            {
              code: {
                contains: params.q,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: params.q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(params.status.length > 0
      ? {
          status: {
            in: params.status,
          },
        }
      : {}),
    ...(params.priority.length > 0
      ? {
          priority: {
            in: params.priority,
          },
        }
      : {}),
  };
}

export async function getTasksPage(params: TaskTableSearchParams) {
  const organizationId = await requireCurrentOrganizationId();
  const where = getTaskWhereInput(organizationId, params);

  const rowCount = await db.task.count({ where });
  const pageCount = Math.max(1, Math.ceil(rowCount / params.pageSize));
  const page = Math.min(params.page, pageCount);

  const rows = await db.task.findMany({
    where,
    orderBy: getTaskOrderBy(params.sort, params.order),
    skip: (page - 1) * params.pageSize,
    take: params.pageSize,
  });

  return {
    rows,
    rowCount,
    pageCount,
    page,
    pageSize: params.pageSize,
    q: params.q,
    sort: params.sort,
    order: params.order,
    status: params.status,
    priority: params.priority,
  };
}