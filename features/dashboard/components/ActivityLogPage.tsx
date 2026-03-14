import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  activityIconMap,
  emptyActivityIcon,
  formatActivityAction,
  formatRelativeTime,
  getActivityLogs
} from '@/features/dashboard/lib/activity-log';

export async function ActivityLogPage() {
  const logs = await getActivityLogs();
  const EmptyActivityIcon = emptyActivityIcon;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Activity Log" />
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = activityIconMap[log.action] || emptyActivityIcon;

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {formatActivityAction(log.action)}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <EmptyActivityIcon className="mb-4 h-12 w-12 text-orange-500" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No activity yet</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                When you perform actions like signing in or updating your account,
                they&apos;ll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
