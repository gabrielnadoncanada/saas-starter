import { db } from '@/lib/db/prisma';
import { comparePasswords } from '@/lib/auth/session';
import { ensureCredentialsAuthAccount } from '@/features/auth/lib/auth-account';

export async function authorizeWithCredentials(credentials?: Record<string, string>) {
  const email = credentials?.email?.trim();
  const password = credentials?.password;

  if (!email || !password) {
    return null;
  }

  const user = await db.user.findFirst({
    where: {
      email,
      deletedAt: null
    }
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  await ensureCredentialsAuthAccount(user.id, user.email);

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role
  };
}
