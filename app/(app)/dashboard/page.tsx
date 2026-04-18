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
  const organizationName = overview.organization?.name;

  return (
    <Page>
      <PageHeader eyebrow="Organization">
        <div className="space-y-1">
          <PageTitle>Overview</PageTitle>
          <PageDescription>
            {organizationName
              ? `A live pulse of ${organizationName}.`
              : "A live pulse of your organization."}
          </PageDescription>
        </div>
      </PageHeader>

      <DashboardOverview overview={overview} />
    </Page>
  );
}
