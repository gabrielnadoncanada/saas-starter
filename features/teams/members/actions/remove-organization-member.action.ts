"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { validatedOrganizationOwnerAction } from "@/features/teams/shared/actions/validated-organization-owner-action";
import { removeOrganizationMemberSchema } from "@/features/teams/shared/schemas/organization.schema";
import type { RefreshableFormState } from "@/features/teams/shared/types/organization.types";
import { auth } from "@/shared/lib/auth";

type RemoveOrganizationMemberValues = z.infer<typeof removeOrganizationMemberSchema>;

export type RemoveOrganizationMemberActionState =
  RefreshableFormState<RemoveOrganizationMemberValues>;

export const removeOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof removeOrganizationMemberSchema,
  { refreshKey?: number }
>(
  removeOrganizationMemberSchema,
  async ({ memberId }, _, { organizationId }) => {
    try {
      await auth.api.removeMember({
        headers: await headers(),
        body: {
          memberIdOrEmail: memberId,
          organizationId,
        },
      });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      };
    }

    return {
      success: "Organization member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
