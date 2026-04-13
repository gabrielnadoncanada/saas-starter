import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();
  const organizationNameSuffix = overview.organization?.name
    ? ` ${overview.organization.name}`
    : "";

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            {`Welcome back${organizationNameSuffix}.`}
          </PageDescription>
        </div>

        <PageHeaderActions className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.app.tasks}>
              View Tasks
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.app.assistant}>
              AI Assistant
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.settings.organization}>
              Organization Settings
              <ArrowRight />
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <DashboardOverview overview={overview} />
    </Page>
  );
}
