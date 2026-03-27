"use server";

import { z } from "zod";
import { validatedOrganizationOwnerAction } from "@/features/teams/shared/actions/validated-organization-owner-action";
import { invitationIdSchema } from "@/features/teams/shared/schemas/organization.schema";
import type { RefreshableFormState } from "@/features/teams/shared/types/organization.types";
import { resendOrganizationInvitation } from "@/features/teams/invitations/server/resend-organization-invitation";

type ResendOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;

export type ResendOrganizationInvitationActionState =
  RefreshableFormState<ResendOrganizationInvitationValues>;

export const resendOrganizationInvitationAction = validatedOrganizationOwnerAction<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(
  invitationIdSchema,
  async ({ invitationId }, _, { organizationId }) => {
    const result = await resendOrganizationInvitation({
      invitationId,
      organizationId,
    });

    if (result.error) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  },
);
