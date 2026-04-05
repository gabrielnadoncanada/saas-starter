import { getTranslations } from "next-intl/server";

import { InviteOrganizationMemberDialog } from "@/features/organizations/components/invite-organization-member-dialog";
import { OrganizationInvitationsTable } from "@/features/organizations/components/organization-invitations-table";
import { OrganizationMembersTable } from "@/features/organizations/components/organization-members-table";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import { listPendingOrganizationInvitations } from "@/features/organizations/server/organization-invitations";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page-layout";

export default async function MembersPage() {
  const context = await getCurrentOrganizationContext();
  const t = await getTranslations("settings");

  if (!context) {
    return null;
  }

  const invitations = await listPendingOrganizationInvitations(
    context.organization.id,
  );

  return (
    <Page fixed className="ml-0">
      <PageHeader>
        <PageTitle>Members</PageTitle>
        <PageDescription>Manage your organization members and invitations.</PageDescription>
        <PageHeaderActions>
          <InviteOrganizationMemberDialog
            canInviteMembers={context.canInviteMembers}
          />
        </PageHeaderActions>
      </PageHeader>

      <div className="space-y-8 overflow-y-auto pb-6">
        <OrganizationMembersTable
          currentUserId={context.user.id}
          canManageMembers={context.canManageMembers}
          members={context.organization.members}
        />

        <section className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Pending Invitations
            </h2>
            <p className="text-muted-foreground">
              {t("members.pendingCount", { count: invitations.length })}
            </p>
          </div>
          <OrganizationInvitationsTable
            canManageInvitations={context.canInviteMembers}
            invitations={invitations}
          />
        </section>
      </div>
    </Page>
  );
}
