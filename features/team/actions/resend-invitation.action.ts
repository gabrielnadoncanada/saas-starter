'use server';

import { validatedActionWithUser } from '@/lib/auth/middleware';
import { resendInvitation } from '@/features/team/lib/resend-invitation';
import { invitationIdSchema } from '@/features/team/schemas/team.schema';

export const resendInvitationAction = validatedActionWithUser(
  invitationIdSchema,
  async ({ invitationId }, _, user) =>
    resendInvitation({ invitationId, user }),
);
