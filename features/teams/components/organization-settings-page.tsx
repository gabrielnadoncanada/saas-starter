import { RenameOrganizationPanel } from "@/features/teams/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/teams/server/organization-context";

export async function OrganizationSettingsPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  const { organization } = context;

  return (
    <RenameOrganizationPanel
      currentName={organization.name}
      canManage={context.canManageMembers}
    />
  );
}
