import { OrganizationAiSettingsPanel } from "@/features/ai/components/organization-ai-settings-panel";
import { getOrganizationAiSettings } from "@/features/ai/server/organization-ai-settings";
import { RenameOrganizationPanel } from "@/features/organizations/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization-context";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { getAiModelOptions } from "@/shared/lib/ai/models";

export default async function SettingsPage() {
  const context = await getCurrentOrganizationContext();
  const aiSettings = context
    ? await getOrganizationAiSettings(context.organization.id)
    : null;

  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>
          Manage your organization details and subscription.
        </PageDescription>
      </PageHeader>
      {context ? (
        <div className="space-y-6">
          <RenameOrganizationPanel
            currentName={context.organization.name}
            canManage={context.canManageMembers}
          />
          {aiSettings ? (
            <OrganizationAiSettingsPanel
              canManage={context.canManageMembers}
              modelOptions={getAiModelOptions()}
              settings={aiSettings}
            />
          ) : null}
        </div>
      ) : null}
    </Page>
  );
}
