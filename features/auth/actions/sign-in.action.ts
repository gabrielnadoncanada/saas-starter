'use server';

import { redirect } from 'next/navigation';

import { validatedAction } from '@/lib/auth/middleware';
import { comparePasswords } from '@/lib/auth/session';
import { ActivityType, type NewUser } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { createCheckoutSession } from '@/features/billing/lib/stripe-billing';
import { ensureCredentialsAuthAccount } from '@/features/auth/lib/auth-account';
import { logAuthActivity } from '@/features/auth/lib/auth-activity';
import { establishAuthSession } from '@/features/auth/lib/auth-session';
import { signInSchema } from '@/features/auth/schemas/auth.schema';

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
    logAuthActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

export async function createOwnedUser(email: string, passwordHash: string) {
  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner',
    name: null,
    deletedAt: null
  };

  return db.user.create({
    data: newUser
  });
}
