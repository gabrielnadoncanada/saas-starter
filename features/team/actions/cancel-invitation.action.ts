"use server";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { invitationIdSchema } from "@/features/team/schemas/team.schema";
import { cancelInvitation } from "@/features/team/server/cancel-invitation";

export const cancelInvitationAction = validatedActionWithUser(
  invitationIdSchema,
  async ({ invitationId }, _, user) =>
    cancelInvitation({ invitationId, userId: user.id }),
);
