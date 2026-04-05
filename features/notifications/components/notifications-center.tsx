"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/shared/components/ui/button";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationsCenterProps = {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
};

const notificationsChangedEvent = "notifications:changed";

export function NotificationsCenter({
  initialNotifications,
  initialUnreadCount,
}: NotificationsCenterProps) {
  const t = useTranslations("settings.notifications");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();

  async function loadNotifications() {
    const response = await fetch("/api/notifications?limit=50", {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as {
      notifications: NotificationItem[];
      unreadCount: number;
    };

    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  useEffect(() => {
    function handleNotificationsChanged() {
      void loadNotifications();
    }

    window.addEventListener(notificationsChangedEvent, handleNotificationsChanged);

    return () => {
      window.removeEventListener(
        notificationsChangedEvent,
        handleNotificationsChanged,
      );
    };
  }, []);

  async function markAllAsRead() {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      return;
    }

    await loadNotifications();
    window.dispatchEvent(new Event(notificationsChangedEvent));
  }

  async function clearAllNotifications() {
    const response = await fetch("/api/notifications", {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    setNotifications([]);
    setUnreadCount(0);
    window.dispatchEvent(new Event(notificationsChangedEvent));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("unreadCount", { count: unreadCount })}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || unreadCount === 0}
            onClick={() => startTransition(() => void markAllAsRead())}
          >
            Mark all read
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || notifications.length === 0}
            onClick={() => startTransition(() => void clearAllNotifications())}
          >
            Clear all
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="rounded-lg border p-4">
            <p className="font-medium">{notification.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {notification.body}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
