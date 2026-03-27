"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/shared/lib/auth";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { removeOrganizationMemberSchema } from "@/features/teams/schemas/organization.schema";
import type { RefreshableFormState } from "@/features/teams/types/organization.types";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";

type RemoveOrganizationMemberValues = z.infer<typeof removeOrganizationMemberSchema>;

export type RemoveOrganizationMemberActionState =
  RefreshableFormState<RemoveOrganizationMemberValues>;

export const removeOrganizationMemberAction = validatedActionWithUser<
  typeof removeOrganizationMemberSchema,
  { refreshKey?: number }
>(
  removeOrganizationMemberSchema,
  async ({ memberId }, _, user) => {
    const guard = await requireOrganizationRole(user.id, ["owner"]);

    if (isOrganizationRoleError(guard)) {
      return guard;
    }

    try {
      await auth.api.removeMember({
        headers: await headers(),
        body: {
          memberIdOrEmail: memberId,
          organizationId: guard.organizationId,
        },
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to remove member" };
    }

    return {
      success: "Organization member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
