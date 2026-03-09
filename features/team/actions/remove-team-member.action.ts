'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { logAuthActivity } from '@/features/auth/server/auth-activity';
import { getUserWithTeam } from '@/features/auth/server/current-user';
import { removeTeamMemberSchema } from '@/features/team/schemas/team.schema';

export const removeTeamMemberAction = validatedActionWithUser(
  removeTeamMemberSchema,
  async ({ memberId }, _, user) => {
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

    await logAuthActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);
