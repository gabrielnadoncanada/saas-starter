"use server";

import { headers } from "next/headers";

import { renameOrganizationSchema } from "@/features/organizations/schemas/organization.schema";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import { auth } from "@/shared/lib/auth/auth-config";

export const renameOrganizationAction = validatedAuthenticatedAction<
  typeof renameOrganizationSchema,
  { refreshKey?: number }
>(renameOrganizationSchema, async ({ name }) => {
  try {
    const membership = await requireActiveOrganizationRole(["owner"]);

    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: membership.organizationId,
        data: { name },
      },
    });
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      return { error: error.message };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to rename organization",
    };
  }

  return {
    success: "Organization renamed successfully",
    refreshKey: Date.now(),
  };
});
