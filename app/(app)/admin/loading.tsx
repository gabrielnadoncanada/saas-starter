import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>
          <Skeleton className="h-8 w-32" />
        </PageTitle>
        <PageDescription>
          <Skeleton className="mt-1 h-4 w-64" />
        </PageDescription>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </Page>
  );
}
