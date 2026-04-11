"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { deleteOrganizationSchema } from "@/features/organizations/schemas/organization.schema";
import { routes } from "@/shared/constants/routes";
import { auth } from "@/shared/lib/auth/auth-config";
import { validatedOrganizationOwnerAction } from "@/shared/lib/auth/authenticated-action";
import { db } from "@/shared/lib/db/prisma";

export const deleteOrganizationAction = validatedOrganizationOwnerAction(
  deleteOrganizationSchema,
  async (_, { organizationId }) => {
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { stripeCustomerId: true },
    });

    if (!organization) {
      return { error: "Organization not found." };
    }

    if (organization.stripeCustomerId) {
      const activeSubscription = await db.subscription.findFirst({
        where: {
          stripeCustomerId: organization.stripeCustomerId,
          status: { in: ["active", "trialing"] },
        },
      });

      if (activeSubscription) {
        return {
          error: "Cancel your subscription before deleting this organization.",
        };
      }
    }

    await db.organization.delete({ where: { id: organizationId } });

    const reqHeaders = await headers();
    const remainingOrgs = await auth.api.listOrganizations({
      headers: reqHeaders,
    });
    const nextOrgId = remainingOrgs?.[0]?.id ?? null;

    if (nextOrgId) {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: nextOrgId },
      });
    }

    redirect(routes.app.dashboard);
  },
);
