"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { createOrganizationCheckoutSession } from "@/features/billing/server/better-auth-stripe";
import { isConfiguredStripePriceId } from "@/features/billing/plans";
import {
  getRequiredOrganizationMembership,
  OrganizationMembershipError,
} from "@/features/teams/shared/server/get-required-organization-membership";
import { getCurrentOrganization } from "@/features/teams/shared/server/current-organization";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const rawPriceId = formData.get("priceId");
  const priceId = typeof rawPriceId === "string" ? rawPriceId : null;

  if (!user) {
    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          redirect: "checkout",
          priceId,
        }),
      ),
    );
  }

  try {
    await getRequiredOrganizationMembership(user.id, ["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirect(routes.settings.members);
    }

    throw error;
  }

  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("Organization not found");

  if (!priceId || !isConfiguredStripePriceId(priceId)) {
    throw new Error("Invalid price selected.");
  }

  const url = await createOrganizationCheckoutSession({
    organizationId: organization.id,
    priceId,
    reqHeaders: await headers(),
    seatQuantity: organization.members.length,
  });

  redirect(url);
}
