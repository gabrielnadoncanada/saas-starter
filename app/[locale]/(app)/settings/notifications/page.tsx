import { getUnreadNotificationCount, listUserNotifications } from "@/features/notifications/server/notification-service";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export default async function NotificationsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirectToLocale(locale, routes.auth.login);
  }

  const [notifications, unreadCount] = await Promise.all([
    listUserNotifications(user.id, 50),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Notifications</PageTitle>
        <PageDescription>
          Review product activity, security changes, and billing events for your workspace.
        </PageDescription>
      </PageHeader>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
        </p>

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
    </Page>
  );
}
