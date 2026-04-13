"use server";

import { headers } from "next/headers";
import type { z } from "zod";

import { renameOrganizationSchema } from "@/features/organizations/organization.schema";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { auth } from "@/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";
import type { FormActionState } from "@/types/form-action-state";

type RenameOrganizationActionState = FormActionState<
  z.infer<typeof renameOrganizationSchema>
> & {
  refreshKey?: number;
};

export const renameOrganizationAction = validatedAuthenticatedAction(
  renameOrganizationSchema,
  async ({ name }): Promise<RenameOrganizationActionState> => {
    try {
      const membership = await requireActiveOrganizationRole(["owner"]);

      await auth.api.updateOrganization({
        headers: await headers(),
        body: {
          organizationId: membership.organizationId,
          data: { name },
        },
      });

      return {
        success: "Organization renamed successfully",
        refreshKey: Date.now(),
      };
    } catch (error) {
      if (error instanceof OrganizationMembershipError) {
        return { error: error.message };
      }

      throw error;
    }
  },
);
