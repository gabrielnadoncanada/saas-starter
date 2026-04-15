import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { InviteOrganizationMemberDialog } from "@/features/organizations/components/invite-organization-member-dialog";
import { OrganizationInvitationsTable } from "@/features/organizations/components/organization-invitations-table";
import { OrganizationMembersTable } from "@/features/organizations/components/organization-members-table";
import { listPendingOrganizationInvitations } from "@/features/organizations/server/organization-invitations";
import { getCurrentOrganizationContext } from "@/features/organizations/server/organizations";

export default async function MembersPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  const invitations = await listPendingOrganizationInvitations(
    context.organization.id,
  );

  return (
    <Page>
      <PageHeader eyebrow="Settings · Members">
        <PageTitle>Members</PageTitle>
        <PageDescription>
          Manage your organization members and invitations.
        </PageDescription>
        <PageHeaderActions>
          <InviteOrganizationMemberDialog canInviteMembers={context.isOwner} />
        </PageHeaderActions>
      </PageHeader>

      <div className="space-y-8 overflow-y-auto pb-6">
        <OrganizationMembersTable
          currentUserId={context.user.id}
          canManageMembers={context.isOwner}
          members={context.organization.members}
        />

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="label-mono">Pending invitations</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em]">
                Awaiting acceptance
              </h2>
            </div>
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {invitations.length === 1
                ? "1 invitation"
                : `${invitations.length} invitations`}
            </p>
          </div>
          <OrganizationInvitationsTable
            canManageInvitations={context.isOwner}
            invitations={invitations}
          />
        </section>
      </div>
    </Page>
  );
}
