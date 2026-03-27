import { RenameOrganizationPanel } from "@/features/teams/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/teams/server/organization-context";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";

export default async function SettingsPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  const { organization } = context;

  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>
          Manage your organization details and subscription.
        </PageDescription>
      </PageHeader>
      <RenameOrganizationPanel
        currentName={organization.name}
        canManage={context.canManageMembers}
      />
    </Page>
  );
}
