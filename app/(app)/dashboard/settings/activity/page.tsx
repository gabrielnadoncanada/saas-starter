import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import { ContentSection } from '@/features/account/components/settings/content-section';

import { ActivityLogList } from './activity-log-list';

function ActivityLogSkeleton() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-center space-x-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function ActivityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  return (
    <ContentSection
      title='Activity Logs'
      desc='View your recent activity and see what has happened in your account.'
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ActivityLogSkeleton />}>
            <ActivityLogList />
          </Suspense>
        </CardContent>
      </Card>
    </ContentSection>
  );
}
