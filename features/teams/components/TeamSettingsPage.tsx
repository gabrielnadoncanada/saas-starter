import { SettingsPageHeader } from '@/shared/components/shared/SettingsPageHeader';
import { Button } from '@/shared/components/ui/button';
import { customerPortalAction } from '@/features/billing/actions/customer-portal.action';
import { InviteTeamMemberPanel } from '@/features/teams/components/InviteTeamMemberPanel';
import { PendingInvitationsPanel } from '@/features/teams/components/PendingInvitationsPanel';
import { TeamMembersPanel } from '@/features/teams/components/TeamMembersPanel';
import { getCurrentTeam } from '@/features/teams/server/current-team';
import { listPendingInvitationsForCurrentTeam } from '@/features/teams/server/team-invitations';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';

function getSubscriptionLabel(subscriptionStatus: string | null) {
  if (subscriptionStatus === 'active') {
    return 'Billed monthly';
  }

  if (subscriptionStatus === 'trialing') {
    return 'Trial period';
  }

  return 'No active subscription';
}

export async function TeamSettingsPage() {
  const user = await getCurrentUser();
  const team = await getCurrentTeam();
  const invitations = await listPendingInvitationsForCurrentTeam();
  const isOwner =
    !!team?.teamMembers.some((member) => member.user.id === user?.id && member.role === 'OWNER');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Team Settings" />
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium">Current Plan: {team?.planName || 'Free'}</p>
            <p className="text-sm text-muted-foreground">
              {getSubscriptionLabel(team?.subscriptionStatus ?? null)}
            </p>
          </div>
          <form action={customerPortalAction}>
            <Button type="submit" variant="outline">
              Manage Subscription
            </Button>
          </form>
        </div>
      </div>
      <TeamMembersPanel members={team?.teamMembers ?? []} />
      <PendingInvitationsPanel invitations={invitations} />
      <InviteTeamMemberPanel isOwner={isOwner} />
    </section>
  );
}

