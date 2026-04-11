"use server";

import { headers } from "next/headers";
import type { z } from "zod";

import { renameOrganizationSchema } from "@/features/organizations/organization.schema";
import { auth } from "@/shared/lib/auth/auth-config";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

type RenameOrganizationActionState = FormActionState<
  z.infer<typeof renameOrganizationSchema>
> & {
  refreshKey?: number;
};

export const renameOrganizationAction = validatedOrganizationOwnerAction(
  renameOrganizationSchema,
  async ({ name }, { organizationId }): Promise<RenameOrganizationActionState> => {
    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId,
        data: { name },
      },
    });

    return {
      success: "Organization renamed successfully",
      refreshKey: Date.now(),
    };
  },
);
