import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/shared/lib/db/prisma";

type NotificationInput = {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createNotification(input: NotificationInput) {
  return db.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadataJson: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function createNotificationsForUsers(
  organizationId: string,
  userIds: string[],
  input: Omit<NotificationInput, "organizationId" | "userId">,
) {
  if (userIds.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: userIds.map((userId) => ({
      organizationId,
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadataJson: input.metadata as Prisma.InputJsonValue | undefined,
    })),
  });
}

export async function listUserNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  return db.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return db.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function clearUserNotifications(userId: string) {
  return db.notification.deleteMany({
    where: { userId },
  });
}
