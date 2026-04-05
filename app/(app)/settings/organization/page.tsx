

import { RenameOrganizationPanel } from "@/features/organizations/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

export default async function SettingsPage() {
  const context = await getCurrentOrganizationContext();

  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>Manage your organization details and subscription.</PageDescription>
      </PageHeader>
      {context ? (
        <div className="space-y-6">
          <RenameOrganizationPanel
            currentName={context.organization.name}
            canManage={context.canManageMembers}
          />
        </div>
      ) : null}
    </Page>
  );
}
