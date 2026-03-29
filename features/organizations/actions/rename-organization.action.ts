"use server";

import { headers } from "next/headers";
import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";
import { renameOrganizationSchema } from "@/features/organizations/schemas/organization.schema";
import { auth } from "@/shared/lib/auth";

export const renameOrganizationAction = validatedOrganizationOwnerAction<
  typeof renameOrganizationSchema,
  { refreshKey?: number }
>(
  renameOrganizationSchema,
  async ({ name }, _, { organizationId }) => {
    try {
      await auth.api.updateOrganization({
        headers: await headers(),
        body: {
          organizationId,
          data: { name },
        },
      });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to rename organization",
      };
    }

    return {
      success: "Organization renamed successfully",
      refreshKey: Date.now(),
    };
  },
);


