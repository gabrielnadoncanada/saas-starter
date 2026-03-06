import { z } from 'zod';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/prisma';
import { ActivityType } from '@/lib/db/types';
import { inviteTeamMemberToTeam } from '@/lib/team/invitations';

import { logActivity } from './helpers';

const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number()
});

export const removeTeamMemberAction = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db.teamMember.deleteMany({
      where: {
        id: memberId,
        teamId: userWithTeam.teamId
      }
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMemberAction = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
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
