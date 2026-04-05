"use server";

import { headers } from "next/headers";

import { createOrganizationSchema } from "@/features/organizations/schemas/organization.schema";
import { accountFlags } from "@/shared/config/account.config";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import { auth } from "@/shared/lib/auth/auth-config";
import type { FormActionState } from "@/shared/types/form-action-state";

type CreateOrganizationValues = { name: string };
export type CreateOrganizationActionState =
  FormActionState<CreateOrganizationValues> & {
    organizationId?: string;
    refreshKey?: number;
  };

export const createOrganizationAction = validatedAuthenticatedAction<
  typeof createOrganizationSchema,
  { organizationId?: string; refreshKey?: number }
>(createOrganizationSchema, async ({ name }) => {
  if (!accountFlags.allowCreateOrganization) {
    return { error: "Creating organizations is not enabled." };
  }

  try {
    const requestHeaders = await headers();

    const organization = await auth.api.createOrganization({
      headers: requestHeaders,
      body: {
        name,
        slug: crypto.randomUUID(),
      },
    });

    await auth.api.setActiveOrganization({
      headers: requestHeaders,
      body: { organizationId: organization.id },
    });

    return {
      success: "Organization created",
      organizationId: organization.id,
      refreshKey: Date.now(),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization",
    };
  }
});
