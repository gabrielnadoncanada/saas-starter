"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { invitationIdSchema } from "@/features/teams/schemas/organization.schema";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";
import { cancelOrganizationInvitation } from "@/features/teams/server/organization-invitations";

export const cancelOrganizationInvitationAction = validatedActionWithUser<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(
  invitationIdSchema,
  async ({ invitationId }, _, user) => {
    const guard = await requireOrganizationRole(user.id, ["owner"]);

    if (isOrganizationRoleError(guard)) {
      return guard;
    }

    try {
      await cancelOrganizationInvitation({ invitationId });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to cancel invitation",
      };
    }

    return {
      success: "Invitation canceled",
      refreshKey: Date.now(),
    };
  },
);
