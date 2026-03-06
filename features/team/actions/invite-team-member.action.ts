'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { db } from '@/lib/db/prisma';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { inviteTeamMemberToTeam } from '@/features/team/lib/team-invitations';
import { inviteTeamMemberSchema } from '@/features/team/schemas/team.schema';

export const inviteTeamMemberAction = validatedActionWithUser(
  inviteTeamMemberSchema,
  async ({ email, role }, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const team = await db.team.findUnique({
      where: { id: userWithTeam.teamId },
      select: { name: true }
    });

    if (!team) {
      return { error: 'Team not found' };
    }

    return inviteTeamMemberToTeam({
      teamId: userWithTeam.teamId,
      teamName: team.name,
      inviter: user,
      email,
      role
    });
  }
);
