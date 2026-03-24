"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createOrganizationBillingPortalSession } from "@/features/billing/server/better-auth-stripe";
import { routes } from "@/shared/constants/routes";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";
import { getCurrentOrganization } from "@/features/teams/server/current-organization";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  const guard = await requireOrganizationRole(user.id, ["owner"]);
  if (isOrganizationRoleError(guard)) redirect(routes.app.team);

  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId || !organization?.subscriptionStatus) {
    redirect(routes.marketing.pricing);
  }

  const url = await createOrganizationBillingPortalSession({
    organizationId: organization.id,
    reqHeaders: await headers(),
  });

  redirect(url);
}
