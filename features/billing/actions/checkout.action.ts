"use server";

import { redirect } from "next/navigation";

import { buildAuthHref } from "@/features/auth/utils/auth-flow";
import { isTerminalStripeSubscriptionStatus } from "@/features/billing/plans";
import { requireTeamRole, isTeamRoleError } from "@/features/teams/server/require-team-role";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentTeam } from "@/features/teams/server/current-team";
import { createCheckoutSession } from "@/features/billing/server/create-checkout-session";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const priceId = formData.get("priceId") as string;
  const pricingModel = formData.get("pricingModel") as string | null;

  if (!user) {
    redirect(
      buildAuthHref(routes.auth.login, {
        redirect: "checkout",
        priceId,
        pricingModel,
      }),
    );
  }

  const guard = await requireTeamRole(user.id, ["OWNER"]);
  if (isTeamRoleError(guard)) {
    redirect(routes.app.settingsTeam);
  }

  const team = await getCurrentTeam();
  if (!team) throw new Error("Team not found");
  if (
    team.stripeSubscriptionId &&
    !isTerminalStripeSubscriptionStatus(team.subscriptionStatus)
  ) {
    redirect(routes.app.settingsTeam);
  }

  const url = await createCheckoutSession({
    priceId,
    teamId: team.id,
    seatQuantity: team.teamMembers.length,
    stripeCustomerId: team.stripeCustomerId,
    userEmail: user.email,
  });

  redirect(url);
}
