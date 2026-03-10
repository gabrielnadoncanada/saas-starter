'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { cancelInvitation } from '@/features/team/lib/cancel-invitation';
import { invitationIdSchema } from '@/features/team/schemas/team.schema';

export const cancelInvitationAction = validatedActionWithUser(
  invitationIdSchema,
  async ({ invitationId }, _, user) =>
    cancelInvitation({ invitationId, userId: user.id }),
);
