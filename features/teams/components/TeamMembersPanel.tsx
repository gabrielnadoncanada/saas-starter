'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { removeTeamMemberAction } from '@/features/teams/actions/remove-team-member.action';
import type { TeamMemberView } from '@/features/teams/types/team.types';

type ActionState = {
  error?: string;
  refreshKey?: number;
};

type TeamMembersPanelProps = {
  members: TeamMemberView[];
};

function getUserDisplayName(member: TeamMemberView['user']) {
  return member.name || member.email || 'Unknown User';
}

export function TeamMembersPanel({ members }: TeamMembersPanelProps) {
  const router = useRouter();
  const [removeState, removeAction, isRemovePending] = useActionState<ActionState, FormData>(
    removeTeamMemberAction,
    {}
  );

  useFormActionToasts(removeState);

  useEffect(() => {
    if (!removeState.refreshKey) {
      return;
    }

    router.refresh();
  }, [removeState.refreshKey, router]);

  if (!members.length) {
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
          {members.map((member, index) => (
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
                  <Button type="submit" variant="outline" size="sm" disabled={isRemovePending}>
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
