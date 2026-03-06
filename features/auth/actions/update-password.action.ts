'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { logAuthActivity } from '@/features/auth/lib/auth-activity';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { updatePasswordSchema } from '@/features/auth/schemas/account.schema';

export const updatePasswordAction = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;
    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      }),
      logAuthActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);
