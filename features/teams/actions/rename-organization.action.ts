"use server";

import { headers } from "next/headers";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { renameOrganizationSchema } from "@/features/teams/schemas/organization.schema";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";
import { auth } from "@/shared/lib/auth";

export const renameOrganizationAction = validatedActionWithUser<
  typeof renameOrganizationSchema,
  { refreshKey?: number }
>(
  renameOrganizationSchema,
  async ({ name }, _, user) => {
    const guard = await requireOrganizationRole(user.id, ["owner"]);

    if (isOrganizationRoleError(guard)) {
      return guard;
    }

    try {
      const reqHeaders = await headers();
      await auth.api.updateOrganization({
        headers: reqHeaders,
        body: {
          organizationId: guard.organizationId,
          data: { name },
        },
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to rename organization" };
    }

    return { success: "Organization renamed successfully", refreshKey: Date.now() };
  },
);
