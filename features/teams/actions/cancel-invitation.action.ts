"use server";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { invitationIdSchema } from "@/features/teams/schemas/team.schema";
import { cancelInvitation } from "@/features/teams/server/cancel-invitation";

export const cancelInvitationAction = validatedActionWithUser(
  invitationIdSchema,
  async ({ invitationId }, _, user) => {
    const result = await cancelInvitation({ invitationId, userId: user.id });

    if ('error' in result) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  },
);

