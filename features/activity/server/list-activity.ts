import "server-only";

import type {
  ActivityAction,
  ActivityEventMetadata,
  ActivityFeedItem,
} from "@/features/activity/activity.schema";
import { db } from "@/shared/lib/db/prisma";

const DEFAULT_LIMIT = 50;

export async function listOrganizationActivity(
  organizationId: string,
  limit: number = DEFAULT_LIMIT,
): Promise<ActivityFeedItem[]> {
  const events = await db.activityEvent.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return events.map((event) => ({
    id: event.id,
    action: event.action as ActivityAction,
    createdAt: event.createdAt,
    actor: event.actor
      ? {
          id: event.actor.id,
          name: event.actor.name,
          email: event.actor.email,
          image: event.actor.image,
        }
      : null,
    target:
      event.targetType && event.targetId
        ? { type: event.targetType, id: event.targetId }
        : null,
    metadata: (event.metadata as ActivityEventMetadata | null) ?? null,
  }));
}
