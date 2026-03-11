'use client';

import { Suspense, useActionState } from 'react';
import useSWR from 'swr';
import { Loader2, PlusCircle } from 'lucide-react';

import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { customerPortalAction } from '@/features/billing/actions/customer-portal.action';
import { inviteTeamMemberAction } from '@/features/team/actions/invite-team-member.action';
import { removeTeamMemberAction } from '@/features/team/actions/remove-team-member.action';
import { PendingInvitationsPanel } from '@/features/team/components/PendingInvitationsPanel';
import { User, Team, TeamMember } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  error?: string;
  success?: string;
};


type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

function SubscriptionPanel() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">Current Plan: {teamData?.planName || 'Free'}</p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                    ? 'Trial period'
                    : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersPanel() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMemberAction, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) =>
    user.name || user.email || 'Unknown User';

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((name) => name[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getUserDisplayName(member.user)}</p>
                  <p className="text-sm capitalize text-muted-foreground">{member.role}</p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error ? <p className="mt-4 text-red-500">{removeState.error}</p> : null}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberPanel() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const currentMember = teamData?.teamMembers.find((member) => member.user.id === user?.id);
  const isOwner = currentMember?.role === 'OWNER';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMemberAction, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="MEMBER"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="mt-2 flex items-center space-x-2">
                <RadioGroupItem value="MEMBER" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <RadioGroupItem value="OWNER" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error ? <p className="text-red-500">{inviteState.error}</p> : null}
          {inviteState?.success ? <p className="text-green-500">{inviteState.success}</p> : null}
          <Button
            type="submit"
            className="bg-orange-500 text-white hover:bg-orange-600"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner ? (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function PanelSkeleton({ title, className }: { title: string; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function TeamSettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Team Settings" />
      <Suspense fallback={<PanelSkeleton title="Team Subscription" className="mb-8 h-[140px]" />}>
        <SubscriptionPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton title="Team Members" className="mb-8 h-[140px]" />}>
        <TeamMembersPanel />
      </Suspense>
      <PendingInvitationsPanel />
      <Suspense fallback={<PanelSkeleton title="Invite Team Member" className="h-[260px]" />}>
        <InviteTeamMemberPanel />
      </Suspense>
    </section>
  );
}
