import { ActivityFeed } from "@/features/activity/components/activity-feed";
import { listOrganizationActivity } from "@/features/activity/server/list-activity";
import { getCurrentOrganizationContext } from "@/features/organizations/server/organizations";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

export default async function ActivityPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  const events = await listOrganizationActivity(context.organization.id);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Activity</PageTitle>
        <PageDescription>
          Audit log of member, invitation, and billing changes in this
          organization.
        </PageDescription>
      </PageHeader>

      <div className="pb-6">
        <ActivityFeed events={events} />
      </div>
    </Page>
  );
}
