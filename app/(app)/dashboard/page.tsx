import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();
  const workspaceName = overview.organization?.name;

  return (
    <Page>
      <PageHeader eyebrow="Workspace">
        <div className="space-y-1">
          <PageTitle>Overview</PageTitle>
          <PageDescription>
            {workspaceName
              ? `A live pulse of ${workspaceName}.`
              : "A live pulse of your workspace."}
          </PageDescription>
        </div>
      </PageHeader>

      <DashboardOverview overview={overview} />
    </Page>
  );
}
