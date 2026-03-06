'use server';

import { redirect } from 'next/navigation';

import { validatedAction } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/session';
import { ActivityType } from '@/lib/db/types';
import { ensureCredentialsAuthAccount } from '@/features/auth/lib/auth-account';
import { logAuthActivity } from '@/features/auth/lib/auth-activity';
import { establishAuthSession } from '@/features/auth/lib/auth-session';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { consumePasswordResetToken } from '@/features/auth/lib/password-reset';
import { resetPasswordSchema } from '@/features/auth/schemas/auth.schema';

export const resetPasswordAction = validatedAction(
  resetPasswordSchema,
  async ({ token, password }) => {
    const passwordHash = await hashPassword(password);
    const user = await consumePasswordResetToken(token, passwordHash);

    if (!user || user.deletedAt) {
      return {
        error: 'Invalid or expired reset link.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      ensureCredentialsAuthAccount(user.id, user.email),
      establishAuthSession(user),
      logAuthActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    redirect('/dashboard');
  }
);
