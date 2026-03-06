import { db } from '@/lib/db/prisma';

export async function ensureCredentialsAuthAccount(userId: number, email: string) {
  await db.authAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'credentials',
        providerAccountId: email
      }
    },
    update: {
      userId,
      accountType: 'credentials'
    },
    create: {
      userId,
      provider: 'credentials',
      providerAccountId: email,
      accountType: 'credentials'
    }
  });
}
