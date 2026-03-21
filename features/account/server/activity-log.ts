import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth";
import { getAuthSession } from "@/shared/lib/auth/get-session";

type AuditLogEvent = {
  eventKey?: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  createdAt: Date;
  location?: {
    ipAddress?: string;
  };
};

export type ActivityLogStatus = "ready" | "not-configured" | "unavailable";

export type ActivityLogItem = {
  id: string;
  action: string;
  timestamp: Date;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
};

function getActorIds(event: AuditLogEvent) {
  const data = event.eventData ?? {};
  const actorKeys = [
    "triggeredBy",
    "userId",
    "inviterId",
    "acceptedById",
    "cancelledById",
    "rejectedById",
  ];

  return actorKeys
    .map((key) => data[key])
    .filter((value): value is string => typeof value === "string");
}

function toActivityLogItem(
  event: AuditLogEvent,
  prefix: "user" | "organization",
  index: number,
): ActivityLogItem {
  return {
    id: `${prefix}:${event.eventType}:${event.eventKey ?? "event"}:${event.createdAt.toISOString()}:${index}`,
    action: event.eventType,
    timestamp: event.createdAt,
    ipAddress: event.location?.ipAddress ?? null,
    metadata: event.eventData ?? {},
  };
}

export async function getActivityLogs() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  if (!process.env.BETTER_AUTH_API_KEY) {
    return {
      logs: [] as ActivityLogItem[],
      status: "not-configured" as ActivityLogStatus,
    };
  }

  const reqHeaders = await headers();

  try {
    const [userLogs, organizationAudit] = await Promise.all([
      auth.api.getAuditLogs({
        headers: reqHeaders,
        query: { limit: 50 },
      }),
      session.session.activeOrganizationId
        ? auth.api.getAuditLogs({
            headers: reqHeaders,
            query: {
              organizationId: session.session.activeOrganizationId,
              limit: 50,
            },
          })
        : null,
    ]);

    const organizationLogs = organizationAudit
      ? organizationAudit.events.filter((event) =>
          getActorIds(event).includes(session.user.id),
        )
      : [];

    const logs = [
      ...userLogs.events.map((event, index) =>
        toActivityLogItem(event, "user", index),
      ),
      ...organizationLogs.map((event, index) =>
        toActivityLogItem(event, "organization", index),
      ),
    ]
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
      .slice(0, 10);

    return {
      logs,
      status: "ready" as ActivityLogStatus,
    };
  } catch {
    return {
      logs: [] as ActivityLogItem[],
      status: "unavailable" as ActivityLogStatus,
    };
  }
}
