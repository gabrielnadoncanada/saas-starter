import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";
import { OrganizationSettingsPage } from "@/features/teams/organization/components/organization-settings-page";

export default async function SettingsPage() {
  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>
          Manage your organization details and subscription.
        </PageDescription>
      </PageHeader>
      <OrganizationSettingsPage />
    </Page>
  );
}
