import "server-only";

import { Prisma } from "@prisma/client";

import { getActiveOrganizationId } from "@/features/organizations/server/get-active-organization-id";
import type { TaskTableSearchParams } from "@/features/tasks/task-schemas";
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
    default:
      return { createdAt: order };
  }
}

export async function getTasksPage(params: TaskTableSearchParams) {
  const organizationId = await getActiveOrganizationId({ required: true });

  const where: Prisma.TaskWhereInput = {
    organizationId,
  };

  if (params.q) {
    where.OR = [
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
    ];
  }

  if (params.status.length > 0) {
    where.status = { in: params.status };
  }

  if (params.priority.length > 0) {
    where.priority = { in: params.priority };
  }

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
    ...params,
    rows,
    rowCount,
    pageCount,
    page,
  };
}
