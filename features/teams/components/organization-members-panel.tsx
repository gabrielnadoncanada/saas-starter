'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { removeOrganizationMemberAction } from '@/features/teams/actions/remove-organization-member.action';
import type { OrganizationMemberView } from '@/features/teams/types/organization.types';

type ActionState = {
  error?: string;
  refreshKey?: number;
};

type OrganizationMembersPanelProps = {
  currentUserId: string;
  canManageMembers: boolean;
  members: OrganizationMemberView[];
};

function getUserDisplayName(member: OrganizationMemberView['user']) {
  return member.name || member.email || 'Unknown User';
}

export function OrganizationMembersPanel({
  currentUserId,
  canManageMembers,
  members
}: OrganizationMembersPanelProps) {
  const router = useRouter();
  const [removeState, removeAction, isRemovePending] = useActionState<ActionState, FormData>(
    removeOrganizationMemberAction,
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
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No organization members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {members.map((member) => {
            const canRemoveMember =
              canManageMembers &&
              member.role !== 'owner' &&
              member.user.id !== currentUserId;

            return (
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
                {canRemoveMember ? (
                  <form action={removeAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button type="submit" variant="outline" size="sm" disabled={isRemovePending}>
                      {isRemovePending ? 'Removing...' : 'Remove'}
                    </Button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
        {!canManageMembers ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Only organization owners can manage members.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
