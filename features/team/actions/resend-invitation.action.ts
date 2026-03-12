"use server";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { invitationIdSchema } from "@/features/team/schemas/team.schema";
import { resendInvitation } from "@/features/team/server/resend-invitation";

export const resendInvitationAction = validatedActionWithUser(
  invitationIdSchema,
  async ({ invitationId }, _, user) => {
    const result = await resendInvitation({ invitationId, user });

    if ('error' in result) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  },
);
