import { formatDistanceToNow } from 'date-fns';

import { getActivityLogs } from '@/features/account/server/activity-log';
import {
  activityIconMap,
  emptyActivityIcon,
  formatActivityAction,
} from '@/features/account/ui/activity-display';

export async function ActivityLogList() {
  const { logs, status } = await getActivityLogs();
  const EmptyActivityIcon = emptyActivityIcon;

  if (status === 'not-configured') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <EmptyActivityIcon className="mb-4 h-12 w-12 text-orange-500" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Audit logs are not configured
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Set <code>BETTER_AUTH_API_KEY</code> to enable Better Auth audit logs
          for this account.
        </p>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <EmptyActivityIcon className="mb-4 h-12 w-12 text-orange-500" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Activity is temporarily unavailable
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Better Auth audit logs could not be loaded right now.
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <EmptyActivityIcon className="mb-4 h-12 w-12 text-orange-500" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No activity yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          When you perform actions like signing in or updating your account,
          they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
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
                {formatActivityAction(log.action, log.metadata)}
                {log.ipAddress && ` from IP ${log.ipAddress}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(log.timestamp, { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
