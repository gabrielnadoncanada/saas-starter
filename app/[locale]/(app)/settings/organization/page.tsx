import { OrganizationAiSettingsPanel } from "@/features/ai/components/organization-ai-settings-panel";
import { getOrganizationAiSettings } from "@/features/ai/server/organization-ai-settings";
import { RenameOrganizationPanel } from "@/features/organizations/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { getAiModelOptions } from "@/shared/lib/ai/models";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const context = await getCurrentOrganizationContext();
  const aiSettings = context
    ? await getOrganizationAiSettings(context.organization.id)
    : null;

  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>{t("organization.title")}</PageTitle>
        <PageDescription>{t("organization.description")}</PageDescription>
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
