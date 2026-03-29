import "server-only";

import { Prisma } from "@prisma/client";

import { getActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import type { TaskTableSearchParams } from "@/features/tasks/schemas/task-table-search-params.schema";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { db } from "@/shared/lib/db/prisma";

async function requireCurrentOrganizationId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const membership = await getActiveOrganizationMembership(user.id);

  if (!membership?.organizationId) {
    throw new Error("User is not part of an organization");
  }

  return membership.organizationId;
}

function getOrderBy(sort: TaskTableSearchParams["sort"], order: "asc" | "desc") {
  switch (sort) {
    case "title":
      return { title: order } satisfies Prisma.TaskOrderByWithRelationInput;
    case "status":
      return { status: order } satisfies Prisma.TaskOrderByWithRelationInput;
    case "priority":
      return { priority: order } satisfies Prisma.TaskOrderByWithRelationInput;
    case "createdAt":
    default:
      return { createdAt: order } satisfies Prisma.TaskOrderByWithRelationInput;
  }
}

export async function getTasksPage(params: TaskTableSearchParams) {
  const organizationId = await requireCurrentOrganizationId();
  const where: Prisma.TaskWhereInput = {
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
  const rowCount = await db.task.count({ where });
  const pageCount = Math.max(1, Math.ceil(rowCount / params.pageSize));
  const page = Math.min(params.page, pageCount);
  const rows = await db.task.findMany({
    where,
    orderBy: getOrderBy(params.sort, params.order),
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
