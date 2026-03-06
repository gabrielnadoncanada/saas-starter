'use server';

import { redirect } from 'next/navigation';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { comparePasswords } from '@/lib/auth/session';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { clearAuthSession } from '@/features/auth/lib/auth-session';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { deleteAccountSchema } from '@/features/auth/schemas/account.schema';

export const deleteAccountAction = validatedActionWithUser(
  deleteAccountSchema,
  async ({ password }, _, user) => {
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

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
          email: `${user.email}-${user.id}-deleted`
        }
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

    await clearAuthSession();
    redirect('/sign-in');
  }
);
