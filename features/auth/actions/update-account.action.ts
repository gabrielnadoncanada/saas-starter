'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { logAuthActivity } from '@/features/auth/lib/auth-activity';
import { getUserWithTeam } from '@/features/auth/lib/current-user';
import { updateAccountSchema } from '@/features/auth/schemas/account.schema';

export const updateAccountAction = validatedActionWithUser(
  updateAccountSchema,
  async ({ name, email }, _, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { name, email }
      }),
      logAuthActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);
