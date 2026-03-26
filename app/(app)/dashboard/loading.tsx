import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>
          <Skeleton className="h-8 w-48" />
        </PageTitle>
        <PageDescription>
          <Skeleton className="mt-1 h-4 w-72" />
        </PageDescription>
      </PageHeader>
      <PageContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </PageContent>
    </Page>
  );
}
