import { SettingsPageHeader } from '@/shared/components/app/settings-page-header';
import { Button } from '@/shared/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/shared/components/ui/item';
import { customerPortalAction } from '@/features/billing/actions/customer-portal.action';
import { InviteTeamMemberPanel } from '@/features/teams/components/invite-team-member-panel';
import { PendingInvitationsPanel } from '@/features/teams/components/pending-invitations-panel';
import { TeamMembersPanel } from '@/features/teams/components/team-members-panel';
import { getCurrentTeam } from '@/features/teams/server/current-team';
import { listPendingInvitationsForCurrentTeam } from '@/features/teams/server/team-invitations';
import { getPlan, resolveTeamPlan } from '@/features/billing/plans';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';

function getSubscriptionLabel(subscriptionStatus: string | null) {
  if (subscriptionStatus === 'lifetime') {
    return 'Lifetime access';
  }

  if (subscriptionStatus === 'active') {
    return 'Billed monthly';
  }

  if (subscriptionStatus === 'trialing') {
    return 'Trial period';
  }

  if (subscriptionStatus === 'past_due') {
    return 'Payment overdue. Update billing to restore paid access.';
  }

  if (subscriptionStatus === 'unpaid' || subscriptionStatus === 'incomplete') {
    return 'Payment issue. Update billing to continue.';
  }

  return 'No active subscription';
}

export async function TeamSettingsPage() {
  const user = await getCurrentUser();
  const team = await getCurrentTeam();
  const invitations = await listPendingInvitationsForCurrentTeam();
  const plan = getPlan(resolveTeamPlan(team));
  const isOwner =
    !!team?.teamMembers.some((member) => member.user.id === user?.id && member.role === 'OWNER');

  return (
    <>
      <Item variant="outline" className="mb-8">
        <ItemContent>
          <ItemTitle>Current Plan: {plan.name}</ItemTitle>
          <ItemDescription>{getSubscriptionLabel(team?.subscriptionStatus ?? null)}</ItemDescription>
        </ItemContent>
        <ItemActions>
          {isOwner && team?.stripeCustomerId && team?.stripeProductId ? (
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                {team?.pricingModel === 'one_time' ? 'View Billing' : 'Manage Subscription'}
              </Button>
            </form>
          ) : null}
        </ItemActions>
      </Item>
      <TeamMembersPanel members={team?.teamMembers ?? []} />
      <PendingInvitationsPanel invitations={invitations} />
      <InviteTeamMemberPanel isOwner={isOwner} />
    </>
  );
}
