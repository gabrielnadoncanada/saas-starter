'use server';

import { z } from 'zod';
import { db } from '@/lib/db/prisma';
import { ActivityType, type NewUser, type User } from '@/lib/db/types';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { ensureCredentialsAuthAccount } from '@/lib/auth/auth-accounts';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { encode } from 'next-auth/jwt';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  sendPasswordResetEmail
} from '@/lib/auth/password-reset';
import { unlinkOAuthAccountForUser } from '@/lib/auth/linked-accounts';
import { OAUTH_PROVIDER_LABELS } from '@/lib/auth/providers';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getNextAuthCookieName() {
  const isSecure =
    process.env.AUTH_URL?.startsWith('https://') || process.env.NODE_ENV === 'production';

  return isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
}

async function establishAuthSession(user: Pick<User, 'id' | 'email' | 'name' | 'role'>) {
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is not set');
  }

  const token = await encode({
    secret: process.env.AUTH_SECRET,
    maxAge: SESSION_MAX_AGE_SECONDS,
    token: {
      sub: String(user.id),
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role
    }
  });

  (await cookies()).set(getNextAuthCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:
      process.env.AUTH_URL?.startsWith('https://') || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.session-token');
  cookieStore.delete('session');
}

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }

  await db.activityLog.create({
    data: {
      teamId,
      userId,
      action: type,
      ipAddress: ipAddress || ''
    }
  });
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
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

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
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

export const requestPasswordReset = validatedAction(
  requestPasswordResetSchema,
  async ({ email }) => {
    const passwordReset = await createPasswordResetToken(email);

    if (passwordReset) {
      await sendPasswordResetEmail(passwordReset.email, passwordReset.resetUrl);
    }

    return {
      success:
        'If an account exists for this email, a password reset link has been sent.',
      email: ''
    };
  }
);

export async function signOut() {
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

export const resetPassword = validatedAction(
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

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
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

export const deleteAccount = validatedActionWithUser(
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

export const updateAccount = validatedActionWithUser(
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

export const unlinkAuthProvider = validatedActionWithUser(
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

const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number()
});

export const removeTeamMember = validatedActionWithUser(
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

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId: userWithTeam.teamId,
        user: {
          email
        }
      }
    });

    if (existingMember) {
      return { error: 'User is already a member of this team' };
    }

    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        teamId: userWithTeam.teamId,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return { error: 'An invitation has already been sent to this email' };
    }

    await db.$transaction(async (tx) => {
      await tx.invitation.create({
        data: {
          teamId: userWithTeam.teamId,
          email,
          role,
          invitedBy: user.id,
          status: 'pending'
        }
      });

      await tx.activityLog.create({
        data: {
          teamId: userWithTeam.teamId,
          userId: user.id,
          action: ActivityType.INVITE_TEAM_MEMBER,
          ipAddress: ''
        }
      });
    });

    return { success: 'Invitation sent successfully' };
  }
);
