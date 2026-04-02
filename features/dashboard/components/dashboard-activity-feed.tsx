import { getLocale, getTranslations } from "next-intl/server";

type ActivityItem = {
  id: string;
  summary: string;
  createdAt: Date;
  actor: {
    name: string | null;
    email: string;
  } | null;
};

export async function DashboardActivityFeed({
  activity,
}: {
  activity: ActivityItem[];
}) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("dashboard"),
  ]);

  if (activity.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("noActivity")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activity.map((item) => (
        <div key={item.id} className="rounded-lg border p-3">
          <p className="text-sm font-medium">{item.summary}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(item.actor?.name || item.actor?.email || t("someone")) +
              " · " +
              item.createdAt.toLocaleString(locale, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
          </p>
        </div>
      ))}
    </div>
  );
}
