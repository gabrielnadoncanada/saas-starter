import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>
          <Skeleton className="h-8 w-40" />
        </PageTitle>
        <PageDescription>
          <Skeleton className="mt-1 h-4 w-72" />
        </PageDescription>
      </PageHeader>

      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </Page>
  );
}
