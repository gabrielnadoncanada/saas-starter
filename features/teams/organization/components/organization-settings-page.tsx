import { getCurrentOrganizationContext } from "@/features/teams/shared/server/organization-context";
import { RenameOrganizationPanel } from "./rename-organization-panel";

export async function OrganizationSettingsPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  return (
    <RenameOrganizationPanel
      currentName={context.organization.name}
      canManage={context.canManageMembers}
    />
  );
}
