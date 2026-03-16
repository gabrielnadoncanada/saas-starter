"use server";

import { redirect } from "next/navigation";

import type { PricingModel } from "@/features/billing/plans";
import { buildAuthHref } from "@/features/auth/utils/auth-flow";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentTeam } from "@/features/teams/server/current-team";
import { createCheckoutSession } from "@/features/billing/server/create-checkout-session";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const priceId = formData.get("priceId") as string;
  const pricingModel = (formData.get("pricingModel") as PricingModel) || "flat";

  if (!user) {
    redirect(
      buildAuthHref(routes.auth.login, {
        redirect: "checkout",
        priceId,
        pricingModel,
      }),
    );
  }

  const team = await getCurrentTeam();
  if (!team) throw new Error("Team not found");

  const url = await createCheckoutSession({
    priceId,
    stripeCustomerId: team.stripeCustomerId,
    userEmail: user.email,
    userId: user.id,
    pricingModel,
  });

  redirect(url);
}
