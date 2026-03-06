import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ensureCredentialsAuthAccount } from '@/lib/auth/auth-accounts';
import { validatedAction } from '@/lib/auth/middleware';
import {
  consumePasswordResetToken,
  requestPasswordResetForEmail
} from '@/lib/auth/password-reset';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/prisma';
import { ActivityType, type NewUser, type User } from '@/lib/db/types';
import { createCheckoutSession } from '@/lib/payments/stripe';

import {
  clearAuthSession,
  establishAuthSession,
  logActivity
} from './helpers';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signInAction = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const foundUser = await db.user.findFirst({
    where: { email },
    include: {
      teamMembers: {
        take: 1,
        include: {
          team: true
        }
      }
    }
  });

  if (!foundUser) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const foundTeam = foundUser.teamMembers[0]?.team ?? null;
  const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    ensureCredentialsAuthAccount(foundUser.id, foundUser.email),
    establishAuthSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const signUpAction = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db.user.findFirst({
    where: { email }
  });

  if (existingUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);
  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner',
    name: null,
    deletedAt: null
  };

  try {
    const result = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: newUser
      });

      let createdTeam;
      let teamId: number;
      let userRole: string;

      if (inviteId) {
        const invitation = await tx.invitation.findFirst({
          where: {
            id: parseInt(inviteId, 10),
            email,
            status: 'pending'
          }
        });

        if (!invitation) {
          throw new Error('INVALID_OR_EXPIRED_INVITATION');
        }

        teamId = invitation.teamId;
        userRole = invitation.role;

        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: 'accepted' }
        });

        await tx.activityLog.create({
          data: {
            teamId,
            userId: createdUser.id,
            action: ActivityType.ACCEPT_INVITATION,
            ipAddress: ''
          }
        });

        createdTeam = await tx.team.findUnique({ where: { id: teamId } });
        if (!createdTeam) {
          throw new Error('TEAM_NOT_FOUND');
        }
      } else {
        createdTeam = await tx.team.create({
          data: {
            name: `${email}'s Team`
          }
        });

        teamId = createdTeam.id;
        userRole = 'owner';

        await tx.activityLog.create({
          data: {
            teamId,
            userId: createdUser.id,
            action: ActivityType.CREATE_TEAM,
            ipAddress: ''
          }
        });
      }

      await tx.teamMember.create({
        data: {
          userId: createdUser.id,
          teamId,
          role: userRole
        }
      });

      await tx.activityLog.create({
        data: {
          teamId,
          userId: createdUser.id,
          action: ActivityType.SIGN_UP,
          ipAddress: ''
        }
      });

      return { createdUser, createdTeam };
    });

    await Promise.all([
      ensureCredentialsAuthAccount(result.createdUser.id, result.createdUser.email),
      establishAuthSession(result.createdUser)
    ]);

    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      const priceId = formData.get('priceId') as string;
      return createCheckoutSession({ team: result.createdTeam, priceId });
    }

    redirect('/dashboard');
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'INVALID_OR_EXPIRED_INVITATION'
    ) {
      return { error: 'Invalid or expired invitation.', email, password };
    }

    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }
});

const requestPasswordResetSchema = z.object({
  email: z.string().email().min(3).max(255)
});

export const requestPasswordResetAction = validatedAction(
  requestPasswordResetSchema,
  async ({ email }) => requestPasswordResetForEmail(email)
);

export async function signOutAction() {
  const user = (await getUser()) as User | null;
  if (!user) {
    return;
  }

  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  await clearAuthSession();
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Invalid or expired reset link.'),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'New password and confirmation password do not match.',
    path: ['confirmPassword']
  });

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
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    redirect('/dashboard');
  }
);
