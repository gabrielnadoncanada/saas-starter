import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/shared/lib/db/prisma";

type RecordAuditLogInput = {
  organizationId: string;
  actorUserId?: string | null;
  event: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditLog(input: RecordAuditLogInput) {
  return db.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId ?? null,
      event: input.event,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadataJson: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listOrganizationAuditLogs(
  organizationId: string,
  limit = 20,
) {
  return db.auditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}
