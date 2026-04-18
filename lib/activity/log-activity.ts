import "server-only";

import type { Prisma } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/client";

import type {
  ActivityAction,
  ActivityEventMetadata,
} from "@/lib/activity/activity.types";
import { db } from "@/lib/db/prisma";
import { runAsAdmin, runInTenantScope } from "@/lib/db/tenant-scope";

type LogActivityInput = {
  action: ActivityAction;
  organizationId?: string | null;
  actorUserId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: ActivityEventMetadata | null;
};

// Failures are swallowed on purpose — audit logging must never break the
// primary action that triggered it. Call this AFTER the critical write
// succeeds so you never log an event for work that did not happen.
export async function logActivity(input: LogActivityInput): Promise<void> {
  const write = async () => {
    await db.activityEvent.create({
      data: {
        action: input.action,
        organizationId: input.organizationId ?? null,
        actorUserId: input.actorUserId ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata ?? null) as Prisma.NullableJsonNullValueInput | InputJsonValue | undefined,
      },
    });
  };

  try {
    if (!input.organizationId) {
      await runAsAdmin(write);
      return;
    }

    await runInTenantScope(input.organizationId, write);
  } catch (error) {
    console.error("[activity] failed to record event", input.action, error);
  }
}
