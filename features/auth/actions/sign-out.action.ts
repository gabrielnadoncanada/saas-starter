'use server';

import { ActivityType, type User } from '@/lib/db/types';

import { logAuthActivity } from '@/features/auth/lib/auth-activity';
import { clearAuthSession } from '@/features/auth/lib/auth-session';
import { getCurrentUser, getUserWithTeam } from '@/features/auth/lib/current-user';

export async function signOutAction() {
  const user = (await getCurrentUser()) as User | null;
  if (!user) {
    return;
  }

  const userWithTeam = await getUserWithTeam(user.id);
  await logAuthActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  await clearAuthSession();
}
