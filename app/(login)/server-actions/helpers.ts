import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

import { db } from '@/lib/db/prisma';
import { ActivityType, type User } from '@/lib/db/types';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getNextAuthCookieName() {
  const isSecure =
    process.env.AUTH_URL?.startsWith('https://') ||
    process.env.NODE_ENV === 'production';

  return isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
}

export async function establishAuthSession(
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>
) {
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
      process.env.AUTH_URL?.startsWith('https://') ||
      process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.session-token');
  cookieStore.delete('session');
}

export async function logActivity(
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
