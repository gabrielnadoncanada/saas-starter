'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { inviteTeamMemberAction } from '@/features/teams/actions/invite-team-member.action';

type ActionState = {
  error?: string;
  success?: string;
  refreshKey?: number;
};

type InviteTeamMemberPanelProps = {
  isOwner: boolean;
};

export function InviteTeamMemberPanel({
  isOwner
}: InviteTeamMemberPanelProps) {
  const router = useRouter();
  const [inviteState, inviteAction, isInvitePending] = useActionState<ActionState, FormData>(
    inviteTeamMemberAction,
    {}
  );

  useFormActionToasts(inviteState);

  useEffect(() => {
    if (!inviteState.refreshKey) {
      return;
    }

    router.refresh();
  }, [inviteState.refreshKey, router]);

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
