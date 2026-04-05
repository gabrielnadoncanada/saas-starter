"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationMenu() {
  const t = useTranslations("notificationsMenu");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const notificationsChangedEvent = "notifications:changed";

  async function loadNotifications() {
    const response = await fetch("/api/notifications?limit=10", {
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
    void loadNotifications();

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

  async function markOneAsRead(notificationId: string) {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending || unreadCount === 0}
              onClick={() => startTransition(() => void markAllAsRead())}
            >
              Mark all read
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending || notifications.length === 0}
              onClick={() => startTransition(() => void clearAllNotifications())}
            >
              Clear all
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="block cursor-pointer space-y-1 py-3"
              asChild={Boolean(notification.href)}
              onClick={() => startTransition(() => void markOneAsRead(notification.id))}
            >
              {notification.href ? (
                <Link href={notification.href}>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                </Link>
              ) : (
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.settings.notifications}>Open notification center</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
