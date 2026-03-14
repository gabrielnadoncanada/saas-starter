'use client';

import { format, parseISO } from 'date-fns';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToastMessage } from '@/shared/hooks/useToastMessage';
import { cancelInvitationAction } from '@/features/teams/actions/cancel-invitation.action';
import { resendInvitationAction } from '@/features/teams/actions/resend-invitation.action';
import type { PendingInvitationView } from '@/features/teams/types/team.types';

type ActionState = { error?: string; success?: string; refreshKey?: number };

function InvitationRow({ invitation }: { invitation: PendingInvitationView }) {
  const router = useRouter();
  const [cancelState, cancelAction, isCanceling] = useActionState<ActionState, FormData>(
    cancelInvitationAction,
    {}
  );
  const [resendState, resendAction, isResending] = useActionState<ActionState, FormData>(
    resendInvitationAction,
    {}
  );

  useEffect(() => {
    if (!cancelState.refreshKey && !resendState.refreshKey) {
      return;
    }

    router.refresh();
  }, [cancelState.refreshKey, resendState.refreshKey, router]);

  const feedback = cancelState?.error || cancelState?.success || resendState?.error || resendState?.success;
  const isError = cancelState?.error || resendState?.error;

  useToastMessage(feedback, {
    kind: isError ? 'error' : 'success',
  });

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{invitation.email}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {invitation.role} -- invited {format(parseISO(invitation.invitedAt), 'PP')}
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
    </li>
  );
}

export function PendingInvitationsPanel({
  invitations
}: {
  invitations: PendingInvitationView[];
}) {
  if (!invitations.length) return null;

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
