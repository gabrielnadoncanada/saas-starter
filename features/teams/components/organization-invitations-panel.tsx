'use client';

import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToastMessage } from '@/shared/hooks/useToastMessage';
import { cancelOrganizationInvitationAction } from '@/features/teams/actions/cancel-organization-invitation.action';
import { resendOrganizationInvitationAction } from '@/features/teams/actions/resend-organization-invitation.action';
import type { OrganizationInvitationView } from '@/features/teams/types/organization.types';
import { useActionState, useEffect } from 'react';

type ActionState = { error?: string; success?: string; refreshKey?: number };

function OrganizationInvitationRow({ invitation }: { invitation: OrganizationInvitationView }) {
  const router = useRouter();
  const [resendState, resendAction, isResending] = useActionState<ActionState, FormData>(
    resendOrganizationInvitationAction,
    {}
  );
  const [cancelState, cancelAction, isCanceling] = useActionState<ActionState, FormData>(
    cancelOrganizationInvitationAction,
    {}
  );

  useEffect(() => {
    if (!resendState.refreshKey && !cancelState.refreshKey) {
      return;
    }

    router.refresh();
  }, [cancelState.refreshKey, resendState.refreshKey, router]);

  const feedback =
    cancelState?.error ||
    cancelState?.success ||
    resendState?.error ||
    resendState?.success;
  const isError = !!cancelState?.error || !!resendState?.error;

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
            <Button variant="outline" size="sm" disabled={isCanceling}>
              {isCanceling ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              <span className="ml-1">Cancel</span>
            </Button>
          </form>
        </div>
      </div>
    </li>
  );
}

export function OrganizationInvitationsPanel({
  invitations
}: {
  invitations: OrganizationInvitationView[];
}) {
  if (!invitations.length) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Organization Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <OrganizationInvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
