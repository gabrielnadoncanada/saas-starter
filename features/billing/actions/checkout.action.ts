"use server";

import { redirect } from "next/navigation";

import { buildAuthHref } from "@/features/auth/utils/auth-flow";
import {
  CheckoutInProgressError,
  clearCheckoutReservation,
  reserveCheckoutForTeam,
} from "@/features/billing/server/checkout-lock";
import { getStripePrices } from "@/features/billing/server/stripe-catalog";
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

  // Validate priceId against the Stripe catalog allowlist
  const allowedPrices = await getStripePrices();
  const isAllowedPrice = allowedPrices.some((p) => p.id === priceId);
  if (!isAllowedPrice) {
    throw new Error("Invalid price selected.");
  }

  try {
    await reserveCheckoutForTeam(team.id, priceId);

    try {
      const url = await createCheckoutSession({
        priceId,
        teamId: team.id,
        seatQuantity: team.teamMembers.length,
        stripeCustomerId: team.stripeCustomerId,
        userEmail: user.email,
      });

      redirect(url);
    } catch (error) {
      await clearCheckoutReservation(team.id);
      throw error;
    }
  } catch (error) {
    if (error instanceof CheckoutInProgressError) {
      redirect(routes.app.settingsTeam);
    }

    throw error;
  }
}
