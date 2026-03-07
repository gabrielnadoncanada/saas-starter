'use server';

import { redirect } from 'next/navigation';

import { validatedAction } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/session';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { ensureCredentialsAuthAccount } from '@/features/auth/lib/auth-account';
import {
  createEmailVerificationTokenForNewUser,
  sendEmailVerificationEmail
} from '@/features/auth/lib/email-verification';
import { signUpSchema } from '@/features/auth/schemas/auth.schema';

export const signUpAction = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId, priceId, redirect: redirectTo } = data;
  const existingUser = await db.user.findFirst({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      deletedAt: true
    }
  });

  if (existingUser) {
    if (!existingUser.deletedAt && !existingUser.emailVerifiedAt) {
      const verification = await createEmailVerificationTokenForNewUser(existingUser.id, {
        redirect: redirectTo,
        priceId
      });

      if (verification) {
        try {
          await sendEmailVerificationEmail(email, verification.verificationUrl);
        } catch (error) {
          console.error('[auth:sign-up.email-verification-failed]', {
            email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          redirect(
            `/verify-email?email=${encodeURIComponent(email)}&sent=0`
          );
        }

        redirect(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    }

    return {
      error: 'An account already exists for this email. Please sign in instead.',
      email,
      password: ''
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          emailVerifiedAt: null,
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

    await ensureCredentialsAuthAccount(result.createdUser.id, result.createdUser.email);

    const verification = await createEmailVerificationTokenForNewUser(result.createdUser.id, {
      redirect: redirectTo,
      priceId
    });

    let redirectUrl = `/verify-email?email=${encodeURIComponent(result.createdUser.email)}`;

    if (redirectTo === 'checkout') {
      redirectUrl += `&redirect=${redirectTo}`;
    }

    if (priceId) {
      redirectUrl += `&priceId=${encodeURIComponent(priceId)}`;
    }

    if (verification) {
      try {
        await sendEmailVerificationEmail(
          result.createdUser.email,
          verification.verificationUrl
        );
      } catch (error) {
        console.error('[auth:sign-up.email-verification-failed]', {
          email: result.createdUser.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        redirect(`${redirectUrl}&sent=0`);
      }
    }

    redirect(redirectUrl);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED_INVITATION') {
      return { error: 'Invalid or expired invitation.', email, password: '' };
    }

    return {
      error: 'Failed to create user. Please try again.',
      email,
      password: ''
    };
  }
});
