"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { deleteOrganizationSchema } from "@/features/organizations/organization.schema";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { auth } from "@/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";
import { db } from "@/lib/db/prisma";
import { assertNotDemo } from "@/lib/demo";

export const deleteOrganizationAction = validatedAuthenticatedAction(
  deleteOrganizationSchema,
  async () => {
    const demoBlock = assertNotDemo();
    if (demoBlock) return demoBlock;

    try {
      const membership = await requireActiveOrganizationRole(["owner"]);
      const organizationId = membership.organizationId;

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
            error:
              "Cancel your subscription before deleting this organization.",
          };
        }
      }

      const reqHeaders = await headers();

      // better-auth handles the cascade delete, permission re-check (owner),
      // and clears the active organization on the session.
      await auth.api.deleteOrganization({
        headers: reqHeaders,
        body: { organizationId },
      });

      // Auto-select a remaining org so the user lands on a valid tenant.
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
    } catch (error) {
      if (error instanceof OrganizationMembershipError) {
        return { error: error.message };
      }

      throw error;
    }
  },
);
