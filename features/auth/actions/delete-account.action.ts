'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { deleteAccountSchema } from '@/features/auth/schemas/account.schema';

export const deleteAccountAction = validatedActionWithUser(
  deleteAccountSchema,
  async (_, __, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    await db.$transaction(async (tx) => {
      if (userWithTeam?.teamId) {
        await tx.activityLog.create({
          data: {
            teamId: userWithTeam.teamId,
            userId: user.id,
            action: ActivityType.DELETE_ACCOUNT,
            ipAddress: ''
          }
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          email: `${user.email}-${user.id}-deleted`,
          image: null
        }
      });

      await tx.account.deleteMany({
        where: { userId: user.id }
      });

      await tx.session.deleteMany({
        where: { userId: user.id }
      });

      await tx.verificationToken.deleteMany({
        where: { identifier: user.email }
      });

      if (userWithTeam?.teamId) {
        await tx.teamMember.deleteMany({
          where: {
            userId: user.id,
            teamId: userWithTeam.teamId
          }
        });
      }
    });

    return {
      success: 'Account deleted successfully.'
    };
  }
);
