import { Button } from '@/shared/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/shared/components/ui/item';
import { customerPortalAction } from '@/features/billing/actions/customer-portal.action';
import { InviteOrganizationMemberPanel } from '@/features/teams/components/invite-organization-member-panel';
import { OrganizationInvitationsPanel } from '@/features/teams/components/organization-invitations-panel';
import { OrganizationMembersPanel } from '@/features/teams/components/organization-members-panel';
import { RenameOrganizationPanel } from '@/features/teams/components/rename-organization-panel';
import { getPlan, resolveTeamPlan } from '@/features/billing/plans';
import { getCurrentOrganizationContext } from '@/features/teams/server/organization-context';
import { listPendingOrganizationInvitations } from '@/features/teams/server/organization-invitations';

function getSubscriptionLabel(organization: {
  billingInterval?: string | null;
  subscriptionStatus?: string | null;
}) {
  if (
    organization.subscriptionStatus === 'active' &&
    organization.billingInterval === 'month'
  ) {
    return 'Billed monthly';
  }

  if (organization.subscriptionStatus === 'active') {
    return 'Active subscription';
  }

  if (organization.subscriptionStatus === 'trialing') {
    return 'Trial period';
  }

  if (organization.subscriptionStatus === 'past_due') {
    return 'Payment overdue. Update billing to restore paid access.';
  }

  if (
    organization.subscriptionStatus === 'unpaid' ||
    organization.subscriptionStatus === 'incomplete'
  ) {
    return 'Payment issue. Update billing to continue.';
  }

  return 'No active subscription';
}

export async function OrganizationSettingsPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return null;
  }

  const { organization, user } = context;
  const invitations = await listPendingOrganizationInvitations(organization.id);
  const plan = getPlan(resolveTeamPlan(organization));

  return (
    <>
      <RenameOrganizationPanel
        currentName={organization.name}
        canManage={context.canManageMembers}
      />
      <Item variant="outline" className="mb-8 mt-6">
        <ItemContent>
          <ItemTitle>Current Plan: {plan.name}</ItemTitle>
          <ItemDescription>{getSubscriptionLabel(organization)}</ItemDescription>
        </ItemContent>
        <ItemActions>
          {context.canManageBilling &&
          organization.stripeCustomerId &&
          organization.subscriptionStatus ? (
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          ) : null}
        </ItemActions>
      </Item>
      <OrganizationMembersPanel
        currentUserId={user.id}
        canManageMembers={context.canManageMembers}
        members={organization.members ?? []}
      />
      <OrganizationInvitationsPanel invitations={invitations} />
      <InviteOrganizationMemberPanel canInviteMembers={context.canInviteMembers} />
    </>
  );
}
