import { NextResponse } from "next/server";

import {
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/server/notification-service";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    listUserNotifications(user.id, 10),
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
