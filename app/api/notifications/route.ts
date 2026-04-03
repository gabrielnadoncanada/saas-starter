import { NextResponse } from "next/server";

import {
  clearUserNotifications,
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/server/notification-service";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 100)
    : 10;

  const [notifications, unreadCount] = await Promise.all([
    listUserNotifications(user.id, limit),
    getUnreadNotificationCount(user.id),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { notificationId?: string };

  if (body.notificationId) {
    await markNotificationAsRead(body.notificationId, user.id);
  } else {
    await markAllNotificationsAsRead(user.id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearUserNotifications(user.id);

  return NextResponse.json({ success: true });
}
