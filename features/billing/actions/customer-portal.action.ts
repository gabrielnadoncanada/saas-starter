"use server";

import { redirect } from "next/navigation";

import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentTeam } from "@/features/teams/server/current-team";
import { createCustomerPortalSession } from "@/features/billing/server/customer-portal";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  const team = await getCurrentTeam();
  if (!team?.stripeCustomerId || !team?.stripeProductId) {
    redirect(routes.marketing.pricing);
  }

  const url = await createCustomerPortalSession({
    stripeCustomerId: team.stripeCustomerId,
    stripeProductId: team.stripeProductId,
    stripeSubscriptionId: team.stripeSubscriptionId,
  });

  redirect(url);
}
