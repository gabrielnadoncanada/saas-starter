'use server';

import { redirect } from 'next/navigation';

import { validatedAction } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/session';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { createCheckoutSession } from '@/features/billing/lib/stripe-billing';
import { ensureCredentialsAuthAccount } from '@/features/auth/lib/auth-account';
import { establishAuthSession } from '@/features/auth/lib/auth-session';
import { signUpSchema } from '@/features/auth/schemas/auth.schema';

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

  try {
    const result = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'owner',
          name: null,
          deletedAt: null
        }
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
    if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED_INVITATION') {
      return { error: 'Invalid or expired invitation.', email, password };
    }

    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }
});
