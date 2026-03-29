"use server";

import { z } from "zod";
import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";
import { invitationIdSchema } from "@/features/organizations/schemas/membership.schema";
import type { RefreshableFormState } from "@/features/organizations/types/membership.types";
import { cancelOrganizationInvitation } from "@/features/organizations/server/organization-invitations";

type CancelOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;

export type CancelOrganizationInvitationActionState =
  RefreshableFormState<CancelOrganizationInvitationValues>;

export const cancelOrganizationInvitationAction = validatedOrganizationOwnerAction<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(
  invitationIdSchema,
  async ({ invitationId }) => {
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



