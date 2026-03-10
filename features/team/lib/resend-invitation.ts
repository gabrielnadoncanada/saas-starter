import type { User } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { getUserWithTeam } from '@/features/auth/server/current-user';
import { sendTeamInvitationEmail } from '@/lib/email/senders';

type ResendInvitationParams = {
  invitationId: number;
  user: Pick<User, 'id' | 'name' | 'email'>;
};

type ResendInvitationDeps = {
  getUserWithTeam: typeof getUserWithTeam;
  db: Pick<typeof db, 'invitation'>;
  sendTeamInvitationEmail: typeof sendTeamInvitationEmail;
};

const defaultDeps: ResendInvitationDeps = {
  getUserWithTeam,
  db,
  sendTeamInvitationEmail,
};

export async function resendInvitation(
  { invitationId, user }: ResendInvitationParams,
  deps = defaultDeps,
) {
  const userWithTeam = await deps.getUserWithTeam(user.id);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  const invitation = await deps.db.invitation.findFirst({
    where: {
      id: invitationId,
      teamId: userWithTeam.teamId,
      status: 'pending',
    },
    include: { team: { select: { name: true } } },
  } as Parameters<typeof db.invitation.findFirst>[0]);

  if (!invitation) {
    return { error: 'Invitation not found' };
  }

  const invitationWithTeam = invitation as typeof invitation & {
    team: { name: string };
  };

  try {
    await deps.sendTeamInvitationEmail({
      email: invitationWithTeam.email,
      role: invitationWithTeam.role,
      inviterName: user.name || user.email,
      teamName: invitationWithTeam.team.name,
      invitationId: invitationWithTeam.id,
    });
  } catch {
    return { error: 'Failed to send email' };
  }

  return { success: 'Invitation email resent' };
}
