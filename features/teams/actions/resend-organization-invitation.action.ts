"use server";

import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { invitationIdSchema } from "@/features/teams/schemas/organization.schema";
import { resendInvitation } from "@/features/teams/server/resend-organization-invitation";

export const resendOrganizationInvitationAction = validatedActionWithUser<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(
  invitationIdSchema,
  async ({ invitationId }, _, user) => {
    const result = await resendInvitation({ invitationId, user });

    if ("error" in result) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  },
);
