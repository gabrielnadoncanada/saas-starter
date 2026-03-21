"use server";

import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { z } from "zod";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";

const transferOwnershipSchema = z.object({
  newOwnerMemberId: z.string(),
});

export const transferOrganizationOwnershipAction = validatedActionWithUser<
  typeof transferOwnershipSchema,
  { refreshKey?: number }
>(
  transferOwnershipSchema,
  async ({ newOwnerMemberId }, _, user) => {
    const guard = await requireOrganizationRole(user.id, ["owner"]);

    if (isOrganizationRoleError(guard)) {
      return guard;
    }

    try {
      await auth.api.updateMemberRole({
        headers: await headers(),
        body: {
          memberId: newOwnerMemberId,
          role: "owner",
          organizationId: guard.organizationId,
        },
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to transfer ownership" };
    }

    return {
      success: "Ownership transferred successfully.",
      refreshKey: Date.now(),
    };
  },
);
