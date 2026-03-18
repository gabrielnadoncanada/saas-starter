"use server";

import { redirect } from "next/navigation";

import type { PricingModel } from "@/features/billing/plans";
import { routes } from "@/shared/constants/routes";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentTeam } from "@/features/teams/server/current-team";
import { createCustomerPortalSession } from "@/features/billing/server/customer-portal";

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  const guard = await requireTeamRole(user.id, ["OWNER"]);
  if (isTeamRoleError(guard)) redirect(routes.app.settingsTeam);

  const team = await getCurrentTeam();
  if (!team?.stripeCustomerId || !team?.stripeProductId) {
    redirect(routes.marketing.pricing);
  }

  const url = await createCustomerPortalSession({
    stripeCustomerId: team.stripeCustomerId,
    pricingModel: team.pricingModel as PricingModel | null,
    stripeProductId: team.stripeProductId,
    stripeSubscriptionId: team.stripeSubscriptionId,
  });

  redirect(url);
}
