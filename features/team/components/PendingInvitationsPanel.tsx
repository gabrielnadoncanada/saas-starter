'use client';

import { useActionState } from 'react';
import useSWR from 'swr';
import { Loader2, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cancelInvitationAction } from '@/features/team/actions/cancel-invitation.action';
import { resendInvitationAction } from '@/features/team/actions/resend-invitation.action';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type PendingInvitation = {
  id: number;
  email: string;
  role: string;
  invitedAt: string;
};

type ActionState = { error?: string; success?: string };

function InvitationRow({ invitation }: { invitation: PendingInvitation }) {
  const [cancelState, cancelAction, isCanceling] = useActionState<ActionState, FormData>(
    cancelInvitationAction,
    {}
  );
  const [resendState, resendAction, isResending] = useActionState<ActionState, FormData>(
    resendInvitationAction,
    {}
  );

  const feedback = cancelState?.error || cancelState?.success || resendState?.error || resendState?.success;
  const isError = cancelState?.error || resendState?.error;

  if (cancelState?.success) return null;

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{invitation.email}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {invitation.role} -- invited {new Date(invitation.invitedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={resendAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <Button type="submit" variant="outline" size="sm" disabled={isResending}>
              {isResending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
              <span className="ml-1">Resend</span>
            </Button>
          </form>
          <form action={cancelAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <Button type="submit" variant="outline" size="sm" disabled={isCanceling}>
              {isCanceling ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              <span className="ml-1">Cancel</span>
            </Button>
          </form>
        </div>
      </div>
      {feedback && (
        <p className={`text-xs ${isError ? 'text-red-500' : 'text-green-500'}`}>{feedback}</p>
      )}
    </li>
  );
}

export function PendingInvitationsPanel() {
  const { data: invitations } = useSWR<PendingInvitation[]>(
    '/api/team/invitations',
    fetcher
  );

  if (!invitations?.length) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
