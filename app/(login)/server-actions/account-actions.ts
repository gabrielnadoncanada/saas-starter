import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { unlinkOAuthAccountForUser } from '@/lib/auth/linked-accounts';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { OAUTH_PROVIDER_LABELS } from '@/lib/auth/providers';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/prisma';
import { ActivityType } from '@/lib/db/types';

import {
  clearAuthSession,
  logActivity
} from './helpers';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

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
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccountAction = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

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

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccountAction = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { name, email }
      }),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const unlinkAuthProviderSchema = z.object({
  provider: z.enum(['google', 'github'])
});

export const unlinkAuthProviderAction = validatedActionWithUser(
  unlinkAuthProviderSchema,
  async ({ provider }, _, user) => {
    const result = await unlinkOAuthAccountForUser({
      userId: user.id,
      provider
    });

    if (result.status === 'not-found') {
      return {
        provider,
        error: `${OAUTH_PROVIDER_LABELS[provider]} is not linked to this account.`
      };
    }

    if (result.status === 'last-method') {
      return {
        provider,
        error: 'You cannot unlink your last remaining sign-in method.'
      };
    }

    refresh();

    return {
      provider,
      success: `${OAUTH_PROVIDER_LABELS[provider]} unlinked successfully.`
    };
  }
);
