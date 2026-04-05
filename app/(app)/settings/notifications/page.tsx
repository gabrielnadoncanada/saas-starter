import { getTranslations } from "next-intl/server";

import { NotificationsCenter } from "@/features/notifications/components/notifications-center";
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

export default async function NotificationsSettingsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations("settings.notifications");

  if (!user) {
    redirectToLocale(null, routes.auth.login);
  }

  const [notifications, unreadCount] = await Promise.all([
    listUserNotifications(user.id, 50),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription>{t("description")}</PageDescription>
      </PageHeader>

      <NotificationsCenter
        initialNotifications={notifications.map((notification) => ({
          ...notification,
          href: notification.href ?? null,
          readAt: notification.readAt?.toISOString() ?? null,
          createdAt: notification.createdAt.toISOString(),
        }))}
        initialUnreadCount={unreadCount}
      />
    </Page>
  );
}
